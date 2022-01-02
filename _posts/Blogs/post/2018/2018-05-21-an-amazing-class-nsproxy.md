---
layout: post
title: "An Amazing Class: NSProxy"
date: "2018-05-21"
categories: 
  - "it"
tags: 
  - "ios"
---

**NSProxy** is a root class in Objective-C. yes, **NSObject** is not unique root class. From [the definition of NSProxy](https://developer.apple.com/documentation/foundation/nsproxy?language=objc) we can think NSProxy as a simplified NSObject. It just implements protocol. As an abstract class, the methods need to be implemented by subclass. One of them **forwardInvocation:** is the most key method of this class, and it can implement a part of feature of fowarding message.

Typically, proxy is used to implement delegate pattern. For example, making an animal proxy:

```
//AnimalProxy.h

@interface AnimalProxy : NSProxy

- (void)proxyWithAnimal:(NSObject*)anObject;

@end

@interface Bird : NSObject

- (void)fly;

@end

@interface Tiger : NSObject

- (void)eat:(NSString*)food;

@end

//AnimalProxy.m

@interface AnimalProxy()

@property (nonatomic, strong) NSObject *proxyObject;

@end

@implementation AnimalProxy

- (void)proxyWithAnimal:(NSObject *)anObject
{
    self.proxyObject = anObject;
}

- (void)forwardInvocation:(NSInvocation *)invocation
{
    if (self.proxyObject) {

        [invocation setTarget:self.proxyObject];

        if ([self.proxyObject isKindOfClass:[NSClassFromString(@"Tiger") class]]) {
            NSString *str = @"deer";
            [invocation setArgument:&str atIndex:2];
        }

        [invocation invoke];
    }
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel
{
    NSMethodSignature *signature = nil;
    if ([self.proxyObject methodSignatureForSelector:sel]) {
        signature = [self.proxyObject methodSignatureForSelector:sel];
    } else {
        signature = [super methodSignatureForSelector:sel];
    }

    return signature;
}

@end

@implementation Bird

- (void)fly
{
    NSLog(@"Bird flies");
}

@end

@implementation Tiger

- (void)eat:(NSString *)food
{
    NSLog(@"Tiger eats %@",food);
}

@end

```

When I invoked them, I counld get output like this:

```
//NSProxy doesn't have initialization method
AnimalProxy *proxy = [AnimalProxy alloc];     
Tiger *tiger = [[Tiger alloc] init]; 
Bird *bird = [[Bird alloc] init];

[proxy proxyWithAnimal:tiger];  
[proxy performSelector:@selector(eat:) withObject:@"zebra"];

[proxy proxyWithAnimal:bird];   
[proxy performSelector:@selector(fly)];

output:
2018-05-21 21:30:26.866892+0800 MethodDemo[3860:852618] Tiger eats deer
2018-05-21 21:30:26.867248+0800 MethodDemo[3860:852618] Bird flies

```

Developers can use NSProxy to finish many function, such as decoupling, [AOP](http://www.jacklandrin.com/2018/05/15/talking-about-aspect-oriented-programming-in-ios/), method interception and etc. A smart gay called **ibireme** wrote a proxy to solve that NSTimer can't dealloc with CADisplayLink. Let's see his [code from github](https://github.com/ibireme/YYKit/blob/master/YYKit/Utility/YYWeakProxy.h).

```
@interface YYWeakProxy : NSProxy

/**
 The proxy target.
 */
@property (nullable, nonatomic, weak, readonly) id target;

/**
 Creates a new weak proxy for target.

 @param target Target object.

 @return A new proxy object.
 */
- (instancetype)initWithTarget:(id)target;

/**
 Creates a new weak proxy for target.

 @param target Target object.

 @return A new proxy object.
 */
+ (instancetype)proxyWithTarget:(id)target;

@end
```

```
@implementation YYWeakProxy

- (instancetype)initWithTarget:(id)target {
    _target = target;
    return self;
}

+ (instancetype)proxyWithTarget:(id)target {
    return [[YYWeakProxy alloc] initWithTarget:target];
}

- (id)forwardingTargetForSelector:(SEL)selector {
    return _target;
}

- (void)forwardInvocation:(NSInvocation *)invocation {
    void *null = NULL;
    [invocation setReturnValue:&null];
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)selector {
    return [NSObject instanceMethodSignatureForSelector:@selector(init)];
}

- (BOOL)respondsToSelector:(SEL)aSelector {
    return [_target respondsToSelector:aSelector];
}

- (BOOL)isEqual:(id)object {
    return [_target isEqual:object];
}

- (NSUInteger)hash {
    return [_target hash];
}

- (Class)superclass {
    return [_target superclass];
}

- (Class)class {
    return [_target class];
}

- (BOOL)isKindOfClass:(Class)aClass {
    return [_target isKindOfClass:aClass];
}

- (BOOL)isMemberOfClass:(Class)aClass {
    return [_target isMemberOfClass:aClass];
}

- (BOOL)conformsToProtocol:(Protocol *)aProtocol {
    return [_target conformsToProtocol:aProtocol];
}

- (BOOL)isProxy {
    return YES;
}

- (NSString *)description {
    return [_target description];
}

- (NSString *)debugDescription {
    return [_target debugDescription];
}
```
