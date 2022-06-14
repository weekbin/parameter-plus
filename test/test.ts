import Parameter from "../src/parameter";

const params = { name: "weekbin", age: 18 };
const p = new Parameter({ strict: true });
const result = p.validate({ name: { type: "string", required: true } }, params);
console.log(params);
