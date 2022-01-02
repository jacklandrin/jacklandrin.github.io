---
layout: post
title: "The Solution of Live Streaming Quiz Mobile Client"
date: "2018-06-05"
categories: 
  - "it"
tags: 
  - "ios"
---

Live Streaming Quiz(LSQ) is a very prevalent interact game from Q4 2017. Many live streaming video companies all published own quiz feature in Appstore. Today I introduce my project of LSQ.

## 1\. The Way of Playing Quiz

Live Streaming quiz is like joining "Slumdog Millionaire" in your smart phone. There are 10 questions asked by program anchor during the game. The topics of questions are about culture, language, history, music, movie stars and etc. The player have to elect one answer from 4 options in 10 seconds. If you are lucky, select correct all questions, you will divide equally one million dollar with all winner; if else the first six questions are selected right, you will also get some coupons of in-app purchase. When you lose the game, you will become a normal live video audience. But if you have **Resurrect Card**, you will return back the game.

![HQ](/assets/img/images/hq.jpg)

Is it an exciting game? Let me talk about how to implement a LSQ mobile client framework.

## 2\. Technical Workflow

![](/assets/img/images/quiz-1.png)

The technical essence of live streaming quiz is combine of live video streaming, instance message and big data.

- Live Video Streaming
    
    I have told about technology of live streaming video in [the past post](http://www.jacklandrin.com/2018/05/14/how-to-improve-live-video-streaming/). Besides, in LSQ we used an interesting technology for video streaming called **Supplemental Enhancement Information (SEI)**. SEI is used for synchronization between video content and socket message. It makes streaming to transmit more information (e.g. time stamp, json structure) excluding video. You can learn more in [google patent image about SEI](https://patentimages.storage.googleapis.com/4c/8d/e9/d2926bbdcbd146/US20140010277A1.pdf)
    
- Instance Message
    
    LSQ depends keep alive socket to implement many features, such as instance recieving question content, question result, user's comment and online user number. Because there is time offset between the time of client recieving question send by Technical Director and Program Anchor speaking video, video streaming is added SEI time stamp. The delay time is approximately 4s ~ 15s. When the client recieving question content, client analyze the time stamp and save question in memory. When time stamp of streaming SEI greater than the time stamp from instance message, client will display the question panel.
    
- Big Data
    
    When users make their choice, the server asynchronic the different answers. Big data has to advanced perfermance compute the answer and correct of question and usage rate of Resurrect Card . It also need to product a report form in data dashboard for technical director and other supervisors.
    

## 3\. Mobile Client Life Cycle

![](/assets/img/images/quiz-life-cycle.png)

The left arrow means posting data or displaying panel from client; and the right arrow means client receiveing data.

This is a round game's life cycle in client. Client program needs to instancely response based on different information from SEI and socket.

## 4\. Mobile Client Structure Graph

![](/assets/img/images/quiz-framework.png)

The core of LSQ client structure is data management. The **data manager** collects kinds type of data from IM, SEI and HTTP request. And data manager is unique data communication party exclude video, that is in order to decouple UI and data.
