import { ZodType, ZodTypeDef } from 'zod';



export default class Schema<CT> {

  constructor(protected _schema:ZodType<any, ZodTypeDef, CT>) {};

  get schema() {
    return this._schema;
  };

  validadeSchema(data:any):{error?:string, schema?:CT} {    
    const parse = this._schema.safeParse(data);
    if (!parse.success) return {error: 'Schema Incorreto!'};
    const schema = this._schema.parse(data);
    return { schema };
  };

};