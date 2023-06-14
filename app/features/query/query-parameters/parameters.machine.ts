import { ActorRefFrom, StateFrom, assign, sendParent } from "xstate";
import { createMachine } from "xstate";

import { EditorParam, getParamsFromStatement } from "../utils/get-parameters-from-statement";
import { updateEditorParams } from "../utils/update-editor-params";
import { createInitialParams } from "../utils/create-initial-parameters";
import { query } from "@fscrypto/domain";
import { nanoid } from "nanoid";
import { EditorState } from "@codemirror/state";
import { actorSystem } from "~/state";
import { useActor } from "@xstate/react";
import deepEquals from "fast-deep-equal";
import { QueryActorRef } from "~/state/machines";

interface CreateParametersMachineProps {
  parameters: query.Query["parameters"];
  statement: string;
  queryId: string;
}

export const createParametersMachine = ({ parameters, statement, queryId }: CreateParametersMachineProps) => {
  const machine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOklwBcBiAZQFEAVAfToBEBJBgeQCUn2AcjQYBBAQGE6AbQAMAXUSgADgHtYlXCvyKQAD0QAOAyQBsMgKwyA7AEYbMmyZsAWJwBoQAT0Q2AzFZIAJiNA119AywMrAE4DAF84jzQsPEJScgoSXAgAGzBaRiZhEQY6AFk6AQZZBSQQVXUKTW06-QQrQKDAs3NfE2dfGWjrQI9vBGcbYxto4cCrEwNfScDfBKSMHAJiMghKLNz8gDFeMpKi0VKKqpqdBo0tHTaAWmcHEmdJ52i3826YsaIVwmIKfcx-JYuMwyEzrEDJLZpXb7CBgABGKgArvhMAQoAVmMUrpVqvI7moHi1QG0Ol0en0BkMRoCEOZYiRBtFzHZrNETPNYYl4ZtUjsMiRURjsbj8PjdLAKOgKGASOgAGbKgBOyGhRCoCNF6T2mUlWJxeNudXuTUerSBBhBznBvi5fgd3IM5hZf18H2ijid0UG5je0ThBu2Rv2sHQADc8VQIFoVQRYyoANYqmOxsA0RXK1BgfAUS3KCk2ql6RDPGJ+mT+MwDYEuFlWSYkENBjrgp3LKzhkWR5GZbMJsCazUqTUkJQ5JVqqeoEjZ3P5sCF4ul+rl5pPRBWIYkf0RGEmA-ugwshtBZbObrRKwGGyreJCiNI8XjyeaqjyteqjVx2QQYZD1d8xWNMgJynLdrV3O0EH8GQSDbSYll8OxbECCwrzeEgLCfZYDGcKwMMFDYUiHJR0E1dBCy1WACQuEpyhJWCd1talEDZYwwTeN4ZGwyEWQfAJ6QcXwjDBcjhUopFqNo+jx0Y9jGngriED5G9rAMbpXDZPwTBE7lTBMF0+isGJfEGV8KMRHYFLosAGKoKQbFqMs1M4qtNJBVYdL0kwDL6Fl7HsEhHBdeZ-GCA9+zhfAVFReA6nAohyS8ysXm+AJPhcH4LH+aIWW+FCQjy6ylgMPkBzkiDKAyyk9wQV5Sry75fiKlkIhsfDzCfUiDAk1DavsqNMmyPJGorZrnlWfCFkGAYjBMM9wmcXDog7GQSLMwJHEsbCZLS4cJXRM0ZSgab1J88JkKdUinG6GQonrb19qPf0goPYJAi5cxRsNU7R1la7vLaeZeqiA8HAsW9n18FkTB+D5wRcXouRerlAaHT9oM1MGsv3fkSGqxZhidMzLC9LxEEqjt+vRn5LAPY7B3kminIYwnmucYx-MfQLgqClkHU6SYXUMqw-m7HGOcU5zlJnTU4CLCgeYQ6zzFMJZoj+wShtmGwRNK-0XUDFxrE+OWHM5pTNVgMhUCUChxk8prNd8bXFiiuZDf9UKZBej4-CDILrCcAYEgSIA */
    createMachine(
      {
        id: `parameters`,
        tsTypes: {} as import("./parameters.machine.typegen").Typegen0,
        predictableActionArguments: true,
        schema: {
          context: {} as QueryStatementContext,
          events: {} as QueryEvents,
        },
        context: {
          parameters: createInitialParams(statement, parameters, queryId),
          activeParameter: null,
        },
        initial: "empty",
        on: {
          "PARAMETERS.ADD": {
            actions: ["addParameter"],
          },
          "PARAMETERS.UPDATE_PARAMETERS": {
            actions: ["updateParameters", "saveChanges"],
            cond: "areParametersDifferent",
          },
          "PARAMETERS.UPDATE_PARAM_VALUE": {
            actions: ["updateParamValue", "saveChanges"],
          },
          "PARAMETERS.SET_ACTIVE_PAREMETER": {
            actions: ["setActiveParameter"],
          },
          "PARAMETERS.UPDATE_PARAMETER": {
            actions: ["updateParameter", "saveChanges"],
          },
        },
        states: {
          present: {
            always: {
              target: "empty",
              cond: "hasNoParameters",
            },
          },
          empty: {
            always: {
              target: "present",
              cond: "hasParameters",
            },
          },
        },
      },
      {
        actions: {
          addParameter: (_) => {
            const newParamName = `param_${nanoid(4)}`;
            const queryActor = actorSystem.get<QueryActorRef>(`query-${queryId}`);
            const editorView = queryActor?.getSnapshot()?.context?.codeMirrorRef?.getSnapshot()?.context.editorView;
            if (editorView) {
              const currentPosition = editorView?.state.selection.main.head ?? 0;
              editorView?.dispatch({
                changes: { from: currentPosition, insert: `{{${newParamName}}}` },
              });
              editorView.focus();
            }
          },
          updateParameters: assign((context, event) => {
            const statement = event.payload.doc.toString();
            const paramsFromStatement = getParamsFromStatement(statement);
            if (!paramsFromStatement)
              return {
                parameters: [],
              };
            const updatedParams = updateEditorParams(paramsFromStatement, context.parameters, event.payload, queryId);
            return {
              parameters: updatedParams,
            };
          }),
          updateParameter: assign((context, event) => {
            const updatedParams = context.parameters.map((param) => {
              if (param.id === event.payload.id) {
                return {
                  ...param,
                  ...event.payload,
                };
              }
              return param;
            });
            return {
              parameters: updatedParams,
              activeParameter: event.payload,
            };
          }),
          updateParamValue: assign((context, event) => {
            const updatedParams = context.parameters.map((param) => {
              if (param.id === event.id) {
                return {
                  ...param,
                  value: event.value,
                };
              }
              return param;
            });
            return {
              parameters: updatedParams,
            };
          }),
          saveChanges: sendParent((context) => {
            const newParams = context.parameters;
            return {
              type: "QUERY.UPDATE_REQUEST",
              payload: {
                parameters: newParams,
              },
            };
          }),
          setActiveParameter: assign((_, event) => {
            return {
              activeParameter: event.payload,
            };
          }),
        },
        guards: {
          hasParameters: (context) => {
            return context.parameters.length > 0;
          },
          hasNoParameters: (context) => {
            return context.parameters.length === 0;
          },
          areParametersDifferent: (context, event) => {
            const statement = event.payload.doc.toString();
            const paramsFromStatement = getParamsFromStatement(statement);
            if (!paramsFromStatement) return false;
            const updatedParams = updateEditorParams(paramsFromStatement, context.parameters, event.payload, queryId);
            return !deepEquals(context.parameters, updatedParams);
          },
        },
      }
    );
  return machine;
};

type QueryStatementContext = {
  parameters: EditorParam[];
  activeParameter: query.QueryParameter | null;
};

type QueryEvents =
  | { type: "PARAMETERS.ADD" }
  | { type: "PARAMETERS.UPDATE_PARAM_VALUE"; id: string; value: string }
  | { type: "PARAMETERS.UPDATE_PARAMETERS"; payload: EditorState }
  | { type: "PARAMETERS.SET_ACTIVE_PAREMETER"; payload: query.QueryParameter | null }
  | { type: "PARAMETERS.UPDATE_PARAMETER"; payload: query.QueryParameter };

export type QueryStatementRef = ActorRefFrom<ReturnType<typeof createParametersMachine>>;
export type QueryStatementState = StateFrom<ReturnType<typeof createParametersMachine>>;

export const useQueryParameters = (queryId: string) => {
  const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)!;
  const parametersRef = ref.getSnapshot()?.context.parametersRef;
  const [state, send] = useActor(parametersRef!);
  return {
    parameters: state.context.parameters,
    activeParameter: state.context.activeParameter,
    updateValue: (id: string, value: string) => send({ type: "PARAMETERS.UPDATE_PARAM_VALUE", id, value }),
    addParameter: () => send({ type: "PARAMETERS.ADD" }),
    setActiveParameter: (param: query.QueryParameter | null) =>
      send({ type: "PARAMETERS.SET_ACTIVE_PAREMETER", payload: param }),
    updateParameter: (param: query.QueryParameter) => send({ type: "PARAMETERS.UPDATE_PARAMETER", payload: param }),
  };
};
