import { livequery } from "@fscrypto/domain";
import { FunctionSchema } from "@fscrypto/domain/src/data-schema";

export const dummyData: FunctionSchema[] = livequery.providerMap.flatMap((chainNetwork) => {
  const schema = `${chainNetwork.chain}_${chainNetwork.network}`;
  return [
    {
      database: "livequery",
      schema: schema,
      name: "latest_token_balance",
      args: [
        { name: "address", type: "string" },
        { name: "token_address", type: "string" },
      ],
      returnType: "number",
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "historical_token_balance",
      args: [
        { name: "address", type: "string" },
        { name: "token_address", type: "string" },
        { name: "block_number", type: "number" },
      ],
      returnType: "number",
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "latest_native_balance",
      args: [{ name: "address", type: "string" }],
      returnType: "number",
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "historical_native_balance",
      args: [
        { name: "address", type: "string" },
        { name: "block_number", type: "number" },
      ],
      returnType: "number",
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "latest_events",
      args: [
        { name: "contract_address", type: "string" },
        { name: "lookback", type: "number" },
      ],
      returnType: "Event[]", // Assuming the return type
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "latest_decoded_events",
      args: [
        { name: "contract_address", type: "string" },
        { name: "lookback", type: "number" },
        { name: "event_name", type: "string" },
      ],
      returnType: "DecodedEvent[]", // Assuming the return type
      comment: "some random comment goes here",
    },
    {
      database: "livequery",
      schema: schema,
      name: "historical_events",
      args: [
        { name: "contract_address", type: "string" },
        { name: "start_block", type: "number" },
        { name: "end_block", type: "number" },
      ],
      returnType: "Event[]", // Assuming the return type
      comment: "some random comment goes here",
    },
  ];
});
