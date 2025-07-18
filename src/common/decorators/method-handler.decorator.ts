import { pipe } from '@fxts/core';

/**
 * 메소드 본문이 실행되기 전 input parameter를 핸들링
 */
export function PreHandle<Param, Context = any>(
  ...handlers: ((this: Context, param: Param) => Param | Promise<Param>)[]
): MethodDecorator {
  return function (target: any, key: string | symbol, desc: PropertyDescriptor) {
    const method = desc.value; // 기존의 method

    if (method?.constructor?.name === 'AsyncFunction') {
      desc.value = async function (this: Context, param: Param) {
        return await method.call(this, await (pipe as any)(param, ...handlers.map((handler) => handler.bind(this))));
      };
    } else {
      desc.value = function (this: Context, param: Param) {
        return method.call(this, (pipe as any)(param, ...handlers.map((handler) => handler.bind(this))));
      };
    }
  };
}

/**
 * 메소드 본문이 실행된 후 output 값을 핸들링
 */
export function PostHandle<Param, Context = any>(
  ...handlers: ((this: Context, param: Param) => Param | Promise<Param>)[]
): MethodDecorator {
  return function (target: any, key: string | symbol, desc: PropertyDescriptor) {
    const method = desc.value; // 기존의 method

    if (method?.constructor?.name === 'AsyncFunction') {
      desc.value = async function (this: Context, param: Param) {
        return await (pipe as any)(await method.call(this, param), ...handlers.map((handler) => handler.bind(this)));
      };
    } else {
      desc.value = function (this: Context, param: Param) {
        return (pipe as any)(method.call(this, param), ...handlers.map((handler) => handler.bind(this)));
      };
    }
  };
}
