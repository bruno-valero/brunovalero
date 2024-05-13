import { Dispatch, SetStateAction } from 'react';

export type SetState<T> = Dispatch<SetStateAction<T>>;
export type UseState<T> = [T, SetState<T>];
export type SetBoolean = SetState<boolean>;
export type SetNumber = SetState<number>;
export type SetString = SetState<string>;

export type nullish = null | undefined;
export type Obj<K extends string | number | symbol = string, V=any> = Record<K, V>;