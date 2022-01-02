---
layout: post
title: "How to check if a Value is valid in NSArray or NSDictionary?"
date: "2018-05-20"
categories: 
  - "programming"
tags:
  - "Objective-C"
---

I often encounter a problem in my work, that the value from json of server response is not match client's data structure, in paticular PHP server. The result of this problem is application frequently crashing. So in order to solve this problem, I designed a serises of ways to try.

## 1\. Checking Validity Function

I create a Class to check if a value is valid. It contains many functions that check with argument of value:

```
#import <Foundation/Foundation.h>

@interface CheckValidObject : NSObject

BOOL isValidValue(id object);
BOOL isValidObject(id object, Class aClass);
BOOL isValidNSDictionary(id object);
BOOL isValidNSArray(id object);
BOOL isValidNSString(id object);
BOOL isValidNSURL(id object);
BOOL isValidNSNumber(id object);

id getValidObjectFromArray(NSArray *array, NSInteger index);
id getValidObjectFromDictionary(NSDictionary *dic, NSString *key);

void setValidObjectForDictionary(NSMutableDictionary *dic, NSString*key, id value);
void addValidObjectForArray(NSMutableArray *array, id value);
void addValidArrayForArray(NSMutableArray *array, NSArray *value);
void replaceValidObjectForArray(NSMutableArray *array, NSInteger index, id value);

void removeValidObjectFromArray(NSMutableArray *array, NSInteger index);
@end


@implementation CheckValidObject
BOOL isValidValue(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null])
    {
        return YES;
    }
    return NO;
}

BOOL isValidObject(id object, Class aClass)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && [object isKindOfClass:aClass])
    {
        return YES;
    }
    return NO;
}

BOOL isValidNSDictionary(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && ([object isKindOfClass:[NSDictionary class]]||[object isKindOfClass:[NSMutableDictionary class]]))
    {
        return ((NSDictionary*)object).allKeys.count>0?YES:NO;
    }
    return NO;
}

BOOL isValidNSArray(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && [object isKindOfClass:[NSArray class]])
    {
        return ((NSArray*)object).count>0?YES:NO;
    }
    return NO;
}

BOOL isValidNSString(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && [object isKindOfClass:[NSString class]])
    {
        return ((NSString*)object).length>0?YES:NO;
    }
    return NO;
}

BOOL isValidNSURL(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && [object isKindOfClass:[NSURL class]])
    {
        return isValidNSString([object absoluteString])?YES:NO;
    }
    return NO;
}

BOOL isValidNSNumber(id object)
{
    if (object!=nil && (NSNull *)object != [NSNull null] && [object isKindOfClass:[NSNumber class]] && ![((NSNumber*)object) isEqualToNumber:[NSDecimalNumber notANumber]])
    {
        return YES;
    }
    return NO;
}

id getValidObjectFromArray(NSArray *array, NSInteger index)
{
    if (isValidNSArray(array) && index<array.count) {
        return array[index];
    }
    return nil;
}

void removeValidObjectFromArray(NSMutableArray *array, NSInteger index)
{
    if (isValidNSArray(array) && index<array.count) {
        [array removeObjectAtIndex:index];
    }
}

id getValidObjectFromDictionary(NSDictionary *dic, NSString *key)
{
    if (isValidNSDictionary(dic) && isValidNSString(key)) {
        return dic[key];
    }
    return nil;
}

void setValidObjectForDictionary(NSMutableDictionary *dic, NSString*key, id value)
{
    if(value && isValidNSString(key))
    {
        [dic setValue:value forKey:key];
    }
}

void addValidObjectForArray(NSMutableArray *array, id value)
{
    if (array!=nil && (NSNull *)array != [NSNull null] && [array isKindOfClass:[NSArray class]])
    {
        if (value) {
            [array addObject:value];
        }
    }
}

void addValidArrayForArray(NSMutableArray *array, NSArray *value)
{
    if (array!=nil && (NSNull *)array != [NSNull null] && [array isKindOfClass:[NSArray class]])
    {
        if (isValidNSArray(value)) {
            [array addObjectsFromArray:value];
        }
    }
}

void replaceValidObjectForArray(NSMutableArray *array, NSInteger index, id value)
{
    if ((array!=nil && (NSNull *)array != [NSNull null] && [array isKindOfClass:[NSArray class]]) && value && index<array.count) {
        [array replaceObjectAtIndex:index withObject:value];
    }
}
@end


```

When we invoke them, such as setting an object in a dictionary, we write this line :

```
NSMutableDictionary *dict = [NSMutableDictionary dictionary];
setValidObjectForDictionary(dict,@"name",nil);

```

Cause the value is **nil**, the key-value can't be setted in the dict.

But this way has a defect, the function does not belong _NSDictionary_ or _NSArray_. Perhaps adding some method in _NSDictionary_ and _NSArray_ is a better project.

## 2\. Category

Using category is not a bad choice to adding some checking valid method in _NSDictionary_ and _NSArray_. From the defination of categroy in runtime, we can learn class method, instance method, implementation of protocol and proporty are allowed to be added.

```
typedef struct category_t {
    const char *name;
    classref_t cls;
    struct method_list_t *instanceMethods;
    struct method_list_t *classMethods;
    struct protocol_list_t *protocols;
    struct property_list_t *instanceProperties;
} category_t;

```

I created a category of _NSDictionary_ for getting value called `NSDictionary+TypeCast`. I added different method for different value:

```
@interface NSDictionary (TypeCast)

- (BOOL)yxt_hasKey:(NSString *)key;

- (id)yxt_objectForKey:(NSString *)key __attribute__((deprecated));

- (id)yxt_unknownObjectForKey:(NSString*)key;

- (id)yxt_objectForKey:(NSString *)key class:(Class)clazz;

- (NSNumber *)yxt_numberForKey:(NSString *)key defaultValue:(NSNumber *)defaultValue;

- (NSNumber *)yxt_numberForKey:(NSString *)key;

- (NSString *)yxt_stringForKey:(NSString *)key defaultValue:(NSString *)defaultValue;

- (NSString *)yxt_stringForKey:(NSString *)key;

- (NSString*)yxt_validStringForKey:(NSString*)key;

- (NSArray *)yxt_stringArrayForKey:(NSString *)key defaultValue:(NSArray *)defaultValue;

- (NSArray *)yxt_stringArrayForKey:(NSString *)key;

- (NSDictionary *)yxt_dictForKey:(NSString *)key defaultValue:(NSDictionary *)defaultValue;

- (NSDictionary *)yxt_dictForKey:(NSString *)key;

- (NSDictionary *)yxt_validDictForKey:(NSString *)key;

- (NSDictionary *)yxt_dictionaryWithValuesForKeys:(NSArray *)keys;

- (NSArray *)yxt_arrayForKey:(NSString *)key defaultValue:(NSArray *)defaultValue;

- (NSArray *)yxt_arrayForKey:(NSString *)key;

- (NSArray *)yxt_validArrayForKey:(NSString*)key;

- (float)yxt_floatForKey:(NSString *)key defaultValue:(float)defaultValue;

- (float)yxt_floatForKey:(NSString *)key;

- (double)yxt_doubleForKey:(NSString *)key defaultValue:(double)defaultValue;

- (double)yxt_doubleForKey:(NSString *)key;

- (BOOL)yxt_boolForKey:(NSString *)key defaultValue:(BOOL)defaultValue;

- (BOOL)yxt_boolForKey:(NSString *)key;

- (int)yxt_intForKey:(NSString *)key defaultValue:(int)defaultValue;

- (int)yxt_intForKey:(NSString *)key;

- (void)yxt_enumerateKeysAndUnknownObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block;

- (void)yxt_enumerateKeysAndArrayObjectsUsingBlock:(void (^)(id key, NSArray *obj, BOOL *stop))block;

- (void)yxt_enumerateKeysAndDictObjectsUsingBlock:(void (^)(id key, NSDictionary *obj, BOOL *stop))block;

- (void)yxt_enumerateKeysAndStringObjectsUsingBlock:(void (^)(id key, NSString *obj, BOOL *stop))block;

```

Like this, developers can use these method as _NSDictionary's_ method. I enumerated some possible types in above code. One of the things, we should pay attention to is we'd better to add unify prefix to method name, like `yxt_`. This can avoid different categories of same class containing same name method to cover each other. And the implementation is :

```
**
 *  return value mapping with given key from current dictionary.
 */
#define OFK [self objectForKey:key]

@implementation NSDictionary (TypeCast)


- (BOOL)yxt_hasKey:(NSString *)key
{
    return (OFK != nil);
}

#pragma mark - NSObject

- (id)yxt_objectForKey:(NSString *)key
{
    return OFK;
}

- (id)yxt_unknownObjectForKey:(NSString*)key
{
    return OFK;
}


- (id)yxt_objectForKey:(NSString *)key class:(Class)clazz
{
    id obj = OFK;
    if ([obj isKindOfClass:clazz])
    {
        return obj;
    }

    return nil;
}

#pragma mark - NSNumber

- (NSNumber *)yxt_numberForKey:(NSString *)key defaultValue:(NSNumber *)defaultValue
{
    return yxt_numberOfValue(OFK, defaultValue);
}

- (NSNumber *)yxt_numberForKey:(NSString *)key
{
    return [self yxt_numberForKey:key defaultValue:nil];
}

#pragma mark - NSString

- (NSString *)yxt_stringForKey:(NSString *)key defaultValue:(NSString *)defaultValue;
{
    return yxt_stringOfValue(OFK, defaultValue);
}

- (NSString *)yxt_stringForKey:(NSString *)key;
{
    return [self yxt_stringForKey:key defaultValue:nil];
}


- (NSString *)yxt_validStringForKey:(NSString *)key
{
    NSString *stringValue = [self yxt_stringForKey:key];
    if (stringValue.length) {
        return stringValue;
    }
    return nil;
}

#pragma mark - NSArray of NSString

- (NSArray *)yxt_stringArrayForKey:(NSString *)key defaultValue:(NSArray *)defaultValue
{
    return yxt_stringArrayOfValue(OFK, defaultValue);
}

- (NSArray *)yxt_stringArrayForKey:(NSString *)key;
{
    return [self yxt_stringArrayForKey:key defaultValue:nil];
}

#pragma mark - NSDictionary

- (NSDictionary *)yxt_dictForKey:(NSString *)key defaultValue:(NSDictionary *)defaultValue
{
    return yxt_dictOfValue(OFK, defaultValue);
}

- (NSDictionary *)yxt_dictForKey:(NSString *)key
{
    return [self yxt_dictForKey:key defaultValue:nil];
}

- (NSDictionary *)yxt_validDictForKey:(NSString *)key
{
    NSDictionary *dictionary = [self yxt_dictForKey:key];
    if (dictionary.count) {
        return dictionary;
    }
    return nil;
}

- (NSDictionary *)yxt_dictionaryWithValuesForKeys:(NSArray *)keys
{
    return [self dictionaryWithValuesForKeys:keys];
}

#pragma mark - NSArray

- (NSArray *)yxt_arrayForKey:(NSString *)key defaultValue:(NSArray *)defaultValue
{
    return yxt_arrayOfValue(OFK, defaultValue);
}

- (NSArray *)yxt_arrayForKey:(NSString *)key
{
    return [self yxt_arrayForKey:key defaultValue:nil];
}

-(NSArray *)yxt_validArrayForKey:(NSString *)key
{
    NSArray *array = [self yxt_arrayForKey:key];
    if (array.count) {
        return array;
    }
    return nil;
}

#pragma mark - Float

- (float)yxt_floatForKey:(NSString *)key defaultValue:(float)defaultValue;
{
    return yxt_floatOfValue(OFK, defaultValue);
}

- (float)yxt_floatForKey:(NSString *)key;
{
    return [self yxt_floatForKey:key defaultValue:0.0f];
}

#pragma mark - Double

- (double)yxt_doubleForKey:(NSString *)key defaultValue:(double)defaultValue;
{
    return yxt_doubleOfValue(OFK, defaultValue);
}

- (double)yxt_doubleForKey:(NSString *)key;
{
    return [self yxt_doubleForKey:key defaultValue:0.0];
}

#pragma mark - BOOL

- (BOOL)yxt_boolForKey:(NSString *)key defaultValue:(BOOL)defaultValue;
{
    return yxt_boolOfValue(OFK, defaultValue);
}

- (BOOL)yxt_boolForKey:(NSString *)key;
{
    return [self yxt_boolForKey:key defaultValue:NO];
}

#pragma mark - Int

- (int)yxt_intForKey:(NSString *)key defaultValue:(int)defaultValue;
{
    return yxt_intOfValue(OFK, defaultValue);
}

- (int)yxt_intForKey:(NSString *)key;
{
    return [self yxt_intForKey:key defaultValue:0];
}

#pragma mark - Enumerate

- (void)yxt_enumerateKeysAndObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block
{
    [self enumerateKeysAndObjectsUsingBlock:block];
}

- (void)yxt_enumerateKeysAndUnknownObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block
{
    [self enumerateKeysAndObjectsUsingBlock:block];
}

- (void)yxt_enumerateKeysAndObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block withCastFunction:(id (*)(id, id))castFunction
{
    [self enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
        id castedObj = castFunction(obj, nil);
        if (castedObj)
        {
            block(key, castedObj, stop);
        }
    }];
}

- (void)yxt_enumerateKeysAndObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block classes:(id)object, ...
{
    if (!object) return;
    NSMutableArray* classesArray = [NSMutableArray array];
    id paraObj = object;
    va_list objects;
    va_start(objects, object);
    do
    {
        [classesArray addObject:paraObj];
        paraObj = va_arg(objects, id);
    } while (paraObj);
    va_end(objects);

    [self enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
        BOOL allowBlock = NO;
        for (int i = 0; i < classesArray.count; i++)
        {
            if ([obj isKindOfClass:[classesArray objectAtIndex:i]])
            {
                allowBlock = YES;
                break;
            }
        }
        if (allowBlock)
        {
            block(key, obj, stop);
        }
    }];
}

- (void)yxt_enumerateKeysAndArrayObjectsUsingBlock:(void (^)(id key, NSArray *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsUsingBlock:block withCastFunction:yxt_arrayOfValue];
}

- (void)yxt_enumerateKeysAndDictObjectsUsingBlock:(void (^)(id key, NSDictionary *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsUsingBlock:block withCastFunction:yxt_dictOfValue];
}

- (void)yxt_enumerateKeysAndStringObjectsUsingBlock:(void (^)(id key, NSString *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsUsingBlock:block withCastFunction:yxt_stringOfValue];
}

- (void)yxt_enumerateKeysAndNumberObjectsUsingBlock:(void (^)(id key, NSNumber *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsUsingBlock:block withCastFunction:yxt_numberOfValue];
}

#pragma mark - Enumerate with Options

- (void)yxt_enumerateKeysAndObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, id obj, BOOL *stop))block
{
    [self enumerateKeysAndObjectsWithOptions:opts usingBlock:block];
}

- (void)yxt_enumerateKeysAndObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, id obj, BOOL *stop))block withCastFunction:(id (*)(id, id))castFunction
{
    [self enumerateKeysAndObjectsWithOptions:opts usingBlock:^(id key, id obj, BOOL *stop) {
        id castedObj = castFunction(obj, nil);
        if (castedObj)
        {
            block(key, castedObj, stop);
        }
    }];
}

- (void)yxt_enumerateKeysAndArrayObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, NSArray *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsWithOptions:opts usingBlock:block withCastFunction:yxt_arrayOfValue];
}

- (void)yxt_enumerateKeysAndDictObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, NSDictionary *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsWithOptions:opts usingBlock:block withCastFunction:yxt_dictOfValue];
}

- (void)yxt_enumerateKeysAndStringObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, NSString *obj, BOOL *stop))block
{
    [self yxt_enumerateKeysAndObjectsWithOptions:opts usingBlock:block withCastFunction:yxt_stringOfValue];
}

@end
```

If we put these code in subproject of **Cocoapods**, the header will be globally declared. So we don't need to include the .h in every class.

But as an architect I soon noticed that some developers don't know the category's existence. They still used the methods that Objective-C provides. Therefore I must make some limitations.

## 3\. Making some Limitations

[Last post](http://www.jacklandrin.com/2018/05/16/method-in-objective-c-messgae-passing/) I told about the core of method, you should know if a method isn't found in class, `forwardingTargetForSelector` will forward another instance to try to invoke the method. I can use this specify to avoid the methods of _NSDictionary & NSArray_ that Objective-C provides.

```
#import "ResponseObjectProxy.h"

@interface ResponseObjectProxy()

@property (nonatomic, strong) NSObject *responseObject;
+ (id)proxyWithResponseObject:(id)anObject;
@end

@interface ResponseArrayProxy : ResponseObjectProxy

@end

@interface ResponseDictionaryProxy : ResponseObjectProxy

@end


@implementation ResponseObjectProxy

- (id)forwardingTargetForSelector:(SEL)aSelector
{
    return self.responseObject;
}

+ (id)proxyWithResponseObject:(id)anObject
{
    ResponseObjectProxy *proxy = [[self alloc] init];
    proxy.responseObject = anObject;
    return proxy;
}

+ (id)responseObjectWithObject:(id)obj
{
    #ifndef __OPTIMIZE__
       if ([obj isKindOfClass:NSDictionary.class])
       {
           NSMutableDictionary *dict = [NSMutableDictionary dictionary];
           [(NSDictionary *)obj enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
               [dict setObject:[self responseObjectWithObject:obj] forKey:key];
           }];
           return [ResponseDictionaryProxy proxyWithResponseObject:dict];
       }
       else if ([obj isKindOfClass:NSArray.class])
       {
           NSMutableArray *array = [NSMutableArray array];
           [(NSArray *)obj enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
               [array addObject:[self responseObjectWithObject:obj]];
           }];
           return [ResponseArrayProxy proxyWithResponseObject:array];
       }
    #endif
    return obj;
}

+ (id)objectWithResponseObject:(id)responseObj
{
    #ifndef __OPTIMIZE__
        if ([responseObj isKindOfClass:NSDictionary.class])
        {
            NSMutableDictionary *dict = [NSMutableDictionary dictionary];
            [responseObj enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [dict setObject:[self objectWithResponseObject:obj] forKey:obj];
            }];
            return dict;
        }
        else if ([responseObj isKindOfClass:NSArray.class])
        {
            NSMutableArray *array = [NSMutableArray array];
            [responseObj enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [array addObject:[self objectWithResponseObject:obj]];
            }];
            return array;
        }
    #endif
    return responseObj;
}

- (id)throwException
{
    NSAssert(0, @"don't use this method");
    return nil;
}

@end

@implementation ResponseArrayProxy

- (id)objectAtIndex:(NSUInteger)index
{
    return [self throwException];
}

- (id)objectAtIndexedSubscript:(NSUInteger)idx
{
    return [self throwException];
}

- (void)enumerateObjectsUsingBlock:(void (^)(id obj, NSUInteger idx, BOOL *stop))block
{
    [self throwException];
}

- (void)enumerateObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id obj, NSUInteger idx, BOOL *stop))block
{
    [self throwException];
}

@end


@implementation ResponseDictionaryProxy

- (id)objectForKeyedSubscript:(id)key
{
    return [self throwException];
}

- (id)objectForKey:(id)aKey
{
    return [self throwException];
}

- (id)valueForKey:(NSString *)key
{
    return [self throwException];
}

- (void)enumerateKeysAndObjectsUsingBlock:(void (^)(id key, id obj, BOOL *stop))block
{
    [self throwException];
}

- (void)enumerateKeysAndObjectsWithOptions:(NSEnumerationOptions)opts usingBlock:(void (^)(id key, id obj, BOOL *stop))block
{
    [self throwException];
}

@end
```

When the program recieves the response data, use the `+responseObjectWithObject:` method to make a proxy for dictionary or array. The developers will think the proxy is response object, but they are wrong. If they use methods that Objective-C provides, the proxy's small name methods will be invoked and throw an assert. And the method not contained in the proxy, like category's methods could be invoke normally. This way can limit develops to still use unsafe method.
