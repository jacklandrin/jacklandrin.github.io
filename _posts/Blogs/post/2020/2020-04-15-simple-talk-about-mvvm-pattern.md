---
layout: post
title: "Simple Talk about - MVVM pattern"
date: "2020-04-15"
categories: 
  - "it"
---

## Personal History about MVVM

About a decade ago, I started to learn client app programming. The first framework that I met was Microsoft WPF. It had a very powerful developing approach that was MVVM. Microsoft provided a series of original syntax and toolkits to help developer implement a client app with MVVM. You don’t only write a WPF client using it, but also Sliverlight and Windows Phone app. So, a C# programmer could easily develop client in different platforms with a same framework. A new markup language, XAML, which was offered by Microsoft, was used as describing UI; C# or other .Net programming languages could be responsible of business logic code. Although Sliverlight and Windows Phone have come down nowadays, the story of MVVM is just beginning.

![Silverlight](/assets/img/images/2C943AF5-C8F5-4465-A1EC-D592C7C6FF94.png)

Because the ecosystem of Windows Phone didn’t survive and grow, I transferred to be an iOS developer six years ago. However, I felt that the developing environment of iOS was primitive - Objective-C is a 50-year-old language and using Xib and Storyboard to describe View layer is a puerile way compared with XAML. The Storyboard will be chaotic and often stuck, while there are a lot of pages that have complex logical relations in a project. Most my colleagues, therefore, develop UI component using programming way rather than Xib and Storyboard, but it could make that the ViewController takes charge of both View and Controller in MVC architecture and it maybe have massive codes in a class. As well as a ViewController needs to maintain the correlation between Models and Views, you must write many equal symbol in your code to keep them update, so it has become a big pool coupling much logic. The samiliar problems also exist in other platforms, which makes MVVM appear in people’s vision again.

In the following years, vue.js, Rx, flutter and SwiftUI all make effort to popularize MVVM. ![Flutter](/assets/img/images/E6301C12-A1BA-4E5C-AA3F-6091A3BCA7F4.jpeg)

## What is MVVM?

There are three layers in a MVVM architecture - View, ViewModel and Model. Most articles explain the relation of layers referencing this following diagram: ![MVVM](/assets/img/images/D98BE215-15C7-499F-B381-F30B9B1D0A4E.png)

- **View**: describing the UI of components or pages. The information and animation is shown and interaction with users is offered in this layer. It’s merely binded with ViewModel, which means ViewModel is View’s unique data source - the data includes text, size, image etc. - and the users’ operations also trigger the event of ViewModel. So, View only does two things, declaring components and appointing their data source and event.
- **ViewModel**: It has two important things, property and event. The ViewModel properties are always dynamic data, which means they are often changed. So, the setter method of property needs to be written. While a property is set, such as due to network response in Model layer, a signal will be published to an observer that is used to refresh View’s relevent data automatically. Besides, ViewModel can be invoked by View’s events, such as gesture, toggle, pressing button etc. These events also can change ViewModel’s properties . Meanwhile, ViewModel will update data of Model. Thus, Model was decoupled completely from ViewModel.
- **Model**: It’s abstract model for non-UI data, though perhaps some fields are as same as ViewModel. Moreover, some foundemental data processing and business logic could be written in this layer, such as network request, database operation, communication with keep-alive server.

This architecture has many advantages for from-end development.

- It separates the UI and business logic. Designers could directly import their works to project as View layer from some design software like Sketch, since independent View layer doesn’t demand any programming logic. After that, the programmer just need to set the data source from ViewModel in View. Designer’s and developer’s job is distincted clearly in the structure of organisition, which they only pay attention to own fields in a software engineering. In order to archieve this, Microsoft published Blend for designers in its MVVM framework, which is used to design WPF, Windows Phone’s UI, product animation like Adobe Flash and event debug the app. ![Blend](/assets/img/images/CC54BA97-2DFE-40C9-812F-06B10C7DBF43.png)
- ViewModel helps View and Model decouple. You don’t longer pair complex relations between View and Model in a very large Controller. Modifying any layer won’t influence maginificantly each other. As well as ViewModel and Model could be reused in different project whose logic is similar, event you can easily redevelop a Mac application, if you have had a same business iOS app.
- The observer pattern provides automatic way to bind data, which reduces much workload of development and possibility of bugs. The developer will care data and workflow more rather than how to control View.

Nevertheless, there are serval disadvantages of MVVM:

- It’s hard to learn for beginners, especially the framework is not provided originally such as RxSwift. Although I have developed Microsoft’s MVVM framework for many years, the RxSwift document still make me boring. I think developing a framework that is easy to understand based on UIKit is a hard work. Fortunately, flutter and SwiftUI are published.

![RxSwift](/assets/img/images/F4878A97-1EA4-4525-AC62-F194BA0828E9.jpeg)

- It has a bit of complexity of binding data for some project. In some small projects, it actually brings more workload in binding, and some tiny groups don’t have a lot of memebers, so the way of distinctive View and ViewModel is unnecessary.
- The observers maintain a huge hashtable containing observable objects, which increases more memory consumption.

In conclusion, whether chosing MVVM in your project or not, is dependent on many factors. Though these backwards will impact some people’s decision, I prefer to use it because of its actractive features. Flutter and SwiftUI both are good options for client developers.
