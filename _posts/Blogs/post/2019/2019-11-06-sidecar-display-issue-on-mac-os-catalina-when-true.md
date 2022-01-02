---
layout: post
title: "Sidecar display issue on Mac OS Catalina when True Tone or Night Shift are on"
date: "2019-11-06"
categories: 
  - "it"
tags: 
  - "macbook"
---

Sidecar is a fantastic feature on the newest Mac OS, Catalina. It helps us work on external display space with iPad. ![sidecar](/assets/img/images/IMG_4643.jpg) I upgraded my Macbook Pro to Mac OS 10.15 and my iPad Pro to iPad OS 13.1, but there was some oddness of display colour that the window's shadow was beige not grey.

display issue ![display issue](/assets/img/images/IMG_1779.jpg)

normal display ![normal display](/assets/img/images/IMG_5561.jpg)

I believe many users also encounter the same problem. Then I searched it on google, and some people think this is an Intel graphic card's bug.

This issue will happen, when this **three** conditions are satisfied simultaneously:

- 1\. using sidecar
- 2\. true tone or night shift are on
- 3\. Intel graphic card is running

So, there is a temporary solution:

- **turn off** the true tone and night shift for only Intel graphic card Macbook. ![turn off true tone](/assets/img/images/Screenshot-2019-11-06-at-5.18.20-PM.png)
- If your Macbook has independent graphic card or external graphic card, you can go to **System Preferences -> Energy Saver to uncheck Automatic graphics switching**. ![](/assets/img/images/Screenshot-2019-11-06-at-5.19.48-PM.png)

![](/assets/img/images/Screenshot-2019-11-06-at-5.21.30-PM.png)

However, this way would make your laptop to get warmer even hot and waste more electricity.
