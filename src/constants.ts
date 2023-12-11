export const DEBUG = true
export const MINIFY = false
export const host = "localhost" 
export const port = 8000

//---------------------------------------------------------
//  RPC ---------------------------------------------------
//---------------------------------------------------------

export type RpcId = number;
export type RpcParams = JsonArray | JsonObject;
export type RpcProcedure = string;

export interface RpcRequest {
    id: RpcId;
    procedure: RpcProcedure;
    params?: RpcParams;
}

export interface RpcResponse {
    id: RpcId;
    error: JsonValue;
    result: JsonValue;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [member: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
