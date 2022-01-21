---
layout: post
title: "Architecture of Complex Live Stream Controller"
date: "2020-03-24"
excerpt: In a live stream application, the live stream studio viewController is the most intricate page where there are lots of configurable widgets of kinds of businesses. In my past experience of working, I met that there are nearly 100 widgets on one page and more than ten different types of studio pages. 
categories: 
  - "programming"
tags:
  - "programming"
---

## Problems & Analysis

In a live stream application, the live stream studio viewController is the most intricate page where there are lots of configurable widgets of kinds of businesses. In my past experience of working, I met that there are nearly 100 widgets on one page and more than ten different types of studio pages. Hence, the code of this page will hard to maintain and sustainable develop, even cause software disaster of management, if only one viewController manages all business logic. But it's the true about our project, which more than 20,000 lines code was written in one file, before I refactored it. It was very terrible. 

<p align="center">
<img alt="Sits in the status bar" src="/assets/img/images/IMG_4631.png" width="30%" align="center" />
</p>

Indeed, the live stream page is very complex, so it need to be carefully analyse. The studio businesses could be classified according to their types:

- A. studio for host of live video programme
- B. live of single host for audience
- C. live of single host for audience with shopping
- D. live of hosts loop for audience
- E. live of 1v1 hosts PK for audience
- F. financial live for audience, e.g. stock live
- G. one audience could stream and interact with host
- H. playback video for audience
- I. quiz online
- J. remote claw machine
- K. more ways...

Otherwise, there are massive functions in a studio page and some of them are decided to show or not by server configuration:

- watching video (live streaming or playback)
- sending comments, show comment list or barrage
- showing hosts' information, such as id, name, rank, vip audiences, gold coins, number of audience online, etc
- giving host presents and displaying their animation
- tipping hosts some money
- buying commodities that hosts publish
- sharing video
- recording video
- swipe the screen to switch a live
- browsing rank list
- some games or activities
- showing lite mode that only displays video without any widgets
- rotating horizontal video (most videos are vertical display and fill phone's screen)
- tapping screen to praise hearts
- ... These studios and functions are maintained by different business groups. This diagram reveals our team's organisation structure. ![](/assets/img/images/Architech-group.png)

But some basic and abstract functions are common to these types.

- getting studio information from server.
- playing video (live streaming or playback).
- keep-alive message system, except playback.
- detecting swiping gestures if needed.
- the status of studio displaying, such as closing, entering, temporarily leaving.
- rotating screen orientation if needed.
- a docker view that shows configurable buttons at bottom, such as commenting, sharing, recording, sending presents.
- a host information view with host's audience list.
- a close button at the top-right corner.

These foundational works should have been done in a core business class rather than mixed with other more specific functions in one class. So, next part I'll talk about my main idea about re-design this studio page.

## Core Idea

### 1\. What is the widget?

A widget may be a button, a list, a docker, a dialog box or an animation. In some cases, it is a _View_ providing touching and gesture; in other cases, it is a _Layer_. Thus, a widget should just met some common protocol and could be plugged in studio's certain position. A good design of widget API should be simple and not care developer's own implementation.

So, I defined a **StudioWidgetProtocol** including several basic and common methods for a widget. In this way, all widgets could be regarded as instances of **id**. The group members didn't need to modify too much pieces of code to adapt the new architecture, just implemented serval necessary interface methods.

You can consider a widget as a node, it could be plugged in a container view or father widget and have own children. Besides, the **level** as sort of priority is introduced to this interface, which could be defined as an arranged way in certain order, such as Z axis arrangement and from left to right. The frame of widget shouldn’t be considered in this interface, the business group members should operate it and implement other inner logic in widgets' own classes. The studio is merely responsible for adding them on proper levels and deals with the relations between widgets and studio.

However, I know that many colleagues prefer to use _View_ as a widget in general situations, therefore I provided a **StudioWidget** class which has implemented **StudioWidgetProtocol** and added a bool switch, **isGesturePenetrate**, in case some gestures are intercepted by widget.

### 2\. Distinct layers for Z axis

![](/assets/img/images/levels.jpg) The studio could be neatly divided into five layers on Z axis based on studio's function. From bottom to top, they are:

- **backgroundView** \[0, 100) The backgroundView contains host's default image as studio's background.
- **displayerView** \[100, 200) The displayerView includes the video player control.
- **movableView** \[200, 300) A vertical swiping gesture could be operated on screen, which swaps the mode between lite and non-lite. The lite mode means there is nothing widget above the video player, except an orientate-screen button, a lite-mode-switch button and other a few widgets. Most widgets are added on the movableView, such as comment list, user information, activities icon.
- **liteView** \[300, 400) The liteView contains a lite-mode-switch button and other a few widgets.
- **floatView** \[400, ∞) The dialog boxes, some tip information and animation are popped over on the floatView. This design can make sure that different widgets and demands don't wrongly overlap and mix together. Every layer is defined a level range so that these widgets are plugged into appropriate layers according to their level.

### 3\. How to process events of widgets and studio?

There are two solutions about event transmitting in front of me, with the unique **message bus** and the **broadcast of peer to peer**. Let's see the advantages and disadvantages about both of them.

- **Message Bus** I demand to define a hash table to buffer a message queue and transfer all events. Every body of message must have content, origin and destination. The bus is easy to be devised and the centralise module is very neat. Meanwhile the client SDKs all provide convenient kits of bus, such as **notificationCenter**. Nevertheless, that means every class in project could register as a message receiver as long as it knows the event name, which is not safe.
- **Broadcast** This means every widget and studio has own announcer and can become as a listener itself. The announcer broadcast message to all listeners that have subscribed this event. Although there is a little bother to implement their own announcers for developers, the instances of listeners are explicit and all relations of events could build and manage in a studio controller.

Finally, I prefer to the latter one. I expanded the **StudioWidgetProtocol** to **StudioWidgetProvider** which claimed eventAnnouncer, and every studio has an eventAnnouncer as well. An eventAnnouncer hold up a hash table to collect all listeners. Once an event is triggered, the listeners' delegate methods will be called back and process messages. This is a relation of n to n. I defined a universal method to response events, **void announcerOnEvent(string eventName ,id sender, List userInfo)**. Of course, defining a single instance of message bus is also a good and simple way.

### 4\. A studio controller and good inheritance

A studio controller is not a viewController. It should be retained by a viewController and maintains a studio life cycle that includes all life cycle of a viewController. A studio workflow decides this controller's life cycle, and the below flow chart shows the common workflow of most studio types. ![](/assets/img/images/live-studio-life-cycle.png) Meanwhile, the these steps of workflow should be divided into unambiguous classes contained in a good inheritance. Every class has its clear duty. ![](/assets/img/images/studio-structure.png) The root class of studio controller has only one studioWidget as root view. It's like a canvas on which entire tree structure of widgets is put. Additionally, it's added in the View Controller's view so that the studio also could be set as the part of page but full screen.

The base business class claims main life cycle of studio, and adapts a lot of **virtual methods** for business group overloading. These methods are the ruled timing provided for developers. For example, there are some studio operation methods that define the timing of load studio, will leave studio, did leave studio. As well as the group members could flexibly consider to use which msg system or video player kits.

The touchable view implements three gestures -- **vertical swipe, horizontal swipe and tap** for changing studio, switching lite mode and praising hearts respective. Their response events are opened in this class, which includes swiping distance, event status updating.

The core business achieves some common functions based on above classes. The Z axis layers are defined in this class so that the widgets could be added into studio in this class. Developers, otherwise, could conceal some widgets that don't met their demand, just need to put the widget's level in a concealing list.

The basic business group could inherit the core business class to add some common widgets for most studio types. Then, the other groups could accomplish own studios types based on this architecture.

## Main UML of Architecture

![](/assets/img/images/IMG_0075.jpg) How to abstract an universal model of widgets and comprehend the core of a studio are the key of the design. A good interface could uncouple the logic between studio and widgets. The groups just need to concentrate themselves and their business shouldn't be impacted by others logic. Besides, the studio should be a controller to manage the relations among widgets and between widgets and studio in a MVC pattern.

This architecture still has many problems such as performance and some detail of development isn't considered, for our team needed to rapidly shift to new architecture in short time. Indeed, it has much space that could be optimised.
