---
layout: post
title: "iOS Memory Management"
date: "2018-07-09"
categories: 
  - "it"
tags: 
  - "ios"
---

# iOS Memory Management

## Memory Management in Objective-C

Memory management is the programming discipline of managing the life cycles of objects and freeing them when they are no longer needed. Managing object memory is a matter of performance; if an application doesn’t free unneeded objects, its memory footprint grows and performance suffers. However, garbage collection is not avaliable in iOS. iOS manages memory by reference count. Let's learn about it.

### Reference Count

If someone owes an object, that means the object is useful, thus system shouldn't release this object. When no one need to owe it, it would dealloc. Base this norn, iOS manages memory by reference count. Every time the object adds an owner, and the reference count plus 1, vice versa. If the reference count equal 0, the object's dealloc method should be invoked. Meanwhile, we can use these methods to change the reference count:

| object operation | method | result of operation |
| :-- | :-: | --: |
| create and own object | `alloc` `new` `copy` `mutablecopy` | create object and set reference count equal 1 |
| own object | `retain` | reference count + 1 |
| release object | `release` | reference count - 1 |
| drop object | `dealloc` | when reference count equal 0, it's invoked |

We can comprehend an object's life cycle by these method:

![](/assets/img/images/object_life_cycle_2x.png)

After the creation and initialization phase, an object remains in memory as long as its retain count is greater than zero. Other objects in the program may express an ownership interest in an object by sending it retain or by copying it, and then later relinquish that ownership interest by sending release to the object. While the object is viable, a program may begin the archiving process, in which the object encodes its state in the archive byte stream. When the object receives its final release message, its retain count drops to zero. Consequently, the object’s dealloc method is called, which frees any objects or other memory it has allocated, and the object is destroyed.

In the past, develeper need to manaully manage reference count, we call that manual retain-release (MRR), and now Apple recommands automatic reference counting (ARC) that means you don't need to care these methods above table, when you write code. ARC can help you to automatically add memory management method, when the program compiles.

### Runloop & Autorelease Pool

Runloop is a loop meshanism for managing thread. The Application Kit creates at least one `NSRunloop` instance for one application. The apps run in this loop after launching, as shown in the diagram below, When a touch event happens, the Cocoa Touch framework detects the event, creates an event object, then allocates and initializes an `autorelease pool` that is basically a `NSAutoreleasePool` object (If you use ARC, you cannot use autorelease pools directly. Instead, you should use @autoreleasepool block). Cocoa touch then invokes your application event handler, making the event object available. ![](images/iOS-Application-Event-Loop.png)

The handler may put objects in the autorelease pool or use objects that were put into autorelease pool by other objects.

![](/assets/img/images/ios-autorelease-pool.jpg)

In the MRC, we can use `autorelease` method put a object in the autorelease pool. The `autorelease` method is different with `release` method mentioned in previous chapter. `release` is called immediately; decrementing `retainCount` by 1 and calling dealloc if it becomes zero.

Apple documents about [Run Loops](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Multithreading/RunLoopManagement/RunLoopManagement.html#//apple_ref/doc/uid/10000057i-CH16-SW23).

Apple documents about [NSAutoreleasePool](https://developer.apple.com/documentation/foundation/nsautoreleasepool?language=occ).

### Retain Cycle

- What's the retain cycle?Have a look these code:
    
    ```
    #import <Foundation/Foundation.h>
    
    @class RetainCycleClassB;
    
    @interface RetainCycleClassA : NSObject
    
    @property (nonatomic, strong) RetainCycleClassB *objectB;
    
    @end
    
    --------------------------------------------------------------
    
    #import "RetainCycleClassA.h"
    #import "RetainCycleClassB.h"
    
    @implementation RetainCycleClassA
    
    - (instancetype)init
    {
        if (self = [super init]) {
            self.objectB = [[RetainCycleClassB alloc] initWithClazzA:self];
        }
        return self;
    }
    
    @end
    
    --------------------------------------------------------------
    
    #import "RetainCycleClassA.h"
    
    @interface RetainCycleClassB : NSObject
    
    @property (nonatomic, strong) RetainCycleClassA *objectA;
    
    - (instancetype)initWithClazzA:(RetainCycleClassA*)objectA;
    
    @end
    
    ---------------------------------------------------------------
    
    #import "RetainCycleClassB.h"
    
    @implementation RetainCycleClassB
    
    - (instancetype)initWithClazzA:(RetainCycleClassA *)objectA
    {
        if (self = [super init]) {
            self.objectA = objectA;
        }
        return self;
    }
    
    @end
    
    ```
    
    When you run these code, you won't find that the objectA and objectB release. These both instances formed `retain cycle`.
    
    Retain cycle is a widespread problem of memory management. If there are two objects A and B, and they own each other, they both can't be released, when the life cycle finish ,that will lead to memory leaks.
    
    Just like the first graph in below image. ObjectA's strong pointer points ObjectB and ObjectB's strong pointer points ObjectA, too. In ARC, strong pointer means owning and reference count + 1. This brings a problem, if you want to let ObjectA's reference count equal 0, ObjectB have to be released and you want to let ObjectB released, ObjectA also have to be released. This makes an unsolvable cycle.
    
    ![](/assets/img/images/retain-cycle.png)
- How to avoid retain cycle?
    
    Thereby Apple provides `weak pointer` in ARC. Weak pointer has two features:
    1. It won't make reference count plus 1.
    2. When the object's life cycle is done, the object will be _nil_.Look the second graph in above image. The weak pointer instead of strong pointer. Even though ObjectB just have a pointer to point ObjectA, ObjectB doesn't own objectA and reference count doesn't increase. So like this, the memory of them will be normally released.
- Three circumstances of retain cycle
    
    - delegate
    
    If property `delegate` is declare as strong type, it will lead to retain cycle.
    
    ```
    @property (nonatomic, weak) id <RetainCycleDelegate> delegate;
    
    MyViewController *viewController = [[MyViewController alloc] init];
    viewController.delegate = self; //suppose self is id<RetainCycleDelegate>
    [self.navigationController pushViewController:viewController animated:YES];
    
    ```
    
    - block
    
    ```
    typedef void (^RetainCycleBlock)();
    @property (nonatomic, copy) RetainCycleBlock aBlock;
    if (self.aBlock) {
        self.aBlock();
    }
    
    ```
    
    When block copies, block will strongly point all variables inner block. This class takes the block as own property variable, and self is invoked inner block in this class. That makes a retain cycle.
    
    ```
    self.testObject.aBlock = ^{
        [self doSomething];
    };
    ```
    
    We can use weak reference break up this cycle:
    
    ```
    __weak typeof(self) weakSelf = self;
    self.testObject.aBlock = ^{
        __strong typeof(weakSelf) strongSelft = weakSelf;
        [strongSelft doSomething];
    };
    
    ```
    
    - NSTimer
    
    When we set the `self` as target for NStimer's callback, it will make retain cycle. So we need to set the timer invalidate and set timer _nil_, when the timer complete task.
    
    ```
    - (void)dealloc {
        [self.myTimer invalidate];
        self.myTimer = nil;
    }
    ```
    

To learn more about [memory management in iOS](https://developer.apple.com/library/archive/documentation/General/Conceptual/DevPedia-CocoaCore/MemoryManagement.html)
