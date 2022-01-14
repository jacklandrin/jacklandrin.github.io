---
layout: post
title: "The Principle of ProMotion"
date: "2022-01-14"
excerpt: ProMotion is a significant innovation for screen display. It can dynamically adjust refresh rate based on user's interaction and content, which makes smoother scrolling. This technology is used in iPad Pro, iPhone 13 Pro and M1 Pro/Max Macbook. It not only enhances user experience, but also saves energy in most of time.
tags: 
  - "programming"
categories: 
  - "programming"
---

ProMotion is a significant innovation for screen display. It can dynamically adjust refresh rate based on user's interaction and content, which makes smoother scrolling. This technology is used in iPad Pro, iPhone 13 Pro and M1 Pro/Max Macbook. It not only enhances user experience, but also saves energy in most of time.
In my former article *iOS Graphics: Workflow of Graphics System*, I introduced how the screen refreshes to display graphic. As dynamic refresh rate, however, ProMotion use a new refreshing logic to display graphic. Therefore, developers have to adapt it by externel code.

## Why these refresh rates?

The Aritcle [Optimizing ProMotion Refresh Rates for iPhone 13 Pro and iPad Pro](https://developer.apple.com/documentation/quartzcore/optimizing_promotion_refresh_rates_for_iphone_13_pro_and_ipad_pro) mentions all refresh rate supported by Apple devices. For iPhone 13 Pro, they are 120Hz, 80Hz, 60Hz, 48Hz, 40Hz, 30Hz, 24Hz, 20Hz, 16Hz, 15Hz, 12Hz, 10Hz. Some people are worndering why they are these numbers, why there aren't 90Hz or 100Hz.
The answer is OLED display. The OLED screen use PWM(Pulse-width modulation) Dimming. PWM is different with DC Dimming on LCD display. DC dimming adjusts brightness by changing voltage. However, if the OLED display uses this way, the components’ lifespan will be affected and the colour effect will be not good in some cases. PWM, therefore, is adapted on the OLED devices. Its basics is that it turns the display on and off in a very hight frequency to control brightness. You can easily understant it by the following image.
![](http://www.jacklandrin.com/wp-content/uploads/2022/01/Display-PWM-duty-cycles-img_assist-400x206-1.jpg)
If the brightness is set as 50% in a certain span of time, just keep 50% time is on and 50% time is off in same frequency. This is an easy(or cost-effective) way to achieve aim. Nevertheless, it has serious drawbacks, such as the flicker that may cause eye strain and headaches. Just this isn't today's topic. 

Apple uses PWM on iPhone 13 Pro and M1 Pro/Max Macbook as well, and its rate of controlling brightness is 480Hz, that means the OLED display turns on and off 480 times in one second. For this reason, the refresh rates can only be 480's divisor, unless the graphics can't be normally displayed. So, let's focus these numbers, they are all divible by 480, while 90Hz and 100Hz can't.

## New refreshing flow

Due to Adaptive-Sync display, devices can't update graphics based on screen's VSync. Apple creates a new stradegy for ProMotion. Look at the image blow:
![](http://www.jacklandrin.com/wp-content/uploads/2022/01/promotionflow.png)

The default refresh rate is 120Hz, so the graphics rendered by CPU and GPU will be displayed per 8.33ms. If the time cost exceeds 8.33ms, for example CPU and GPU finish their job in 10ms, the screen won't refresh the graphics. Since I described in above text, iPhone 13 Pro can't support 100Hz(refresh per 10ms), the screen will refresh in 12.5ms(80Hz). The NOP is the waiting time. If the CPU and GPU spends less than 8.33ms in next refreshing, the rate will restore back to 120Hz.

So, the time CPU and GPU spending decides the real refresh rate. This is also the main target of performance optimizing for ProMotion screen.

## How to implement ProMotion?
Apple introduced how to [opitmize for variable refresh rate displays](https://developer.apple.com/videos/play/wwdc2021/10147/) in WWDC21. 
### masOS
We can learn about that developer can set the frame-pacing in macOS like this:
```
[commandBuffer presentDrawable:drawable afterMinimumDuration:interval];
[commandBuffer presentDrawable:drawable atTime:t];
```
or set own `drawable`:
```
[commandBuffer presentDrawable:drawable];
```
Then how much duration is reasionable? If you select set the drawable by yourself, you can calculate the average GPU time as next minimum refreshing duration. Look following code:
```
id<CAMetalDrawable> currentDrawable = [metalLayer nextDrawable];

// Your encoders and command buffers are still available!

NSTimeInterval averageGPUTime = screen.minimumRefreshInterval;

[commandBuffer presentDrawable:currentDrawable afterMinimumDuration:averageGPUTime];

[commandBuffer addCompletedHandler:^(id<MTLCommandBuffer> buffer) {
  const NSTimeInterval GPUTime = buffer.GPUEndTime - buffer.GPUStartTime;

  // Use an exponential moving average
  const double alpha = .25;

  averageGPUTime = (GPUTime * alpha) + (averageGPUTime * (1.0 - alpha));
}];
```
### iPadOS and iOS
``CVDisplayLink`` and ``CADisplayLink`` are used for smooth opitimizing on fixed refresh rate displays. They are still used on variable refresh rate displays.
Timing is the most important thing for refresh graphics. Good timing can reduce NOP time to make display smoother. A regular timer, such as an NSTimer, is very unlikely to be in perfect sync with the display. But CADisplayLink can provide consistent timings. Develepers can use following way to set a reasonable refresh progress by CADisplayLink:
```
- (void)displayLinkCallback:(CADisplayLink *)link {
    progress += link.targetTimestamp - previousTargetTimestamp;
    previousTargetTimestamp = link.targetTimestamp;

    [self renderAnimationWithProgress:progress withDeadline:link.targetTimestamp];
}
```

