export type DataSchemaNode = {
  /** the display name of the the schema node */
  name: string;
  /** the type of the schema node */
  type: DataSchemaNodeType;
  /** this lists all its child nodes */
  children: DataSchemaNode[];
  /** this the datatype of the node. This is good for table column names as they have different types.*/
  dataType?: string;
  /** this is the comment that can be displayed */
  comment?: string;
  /** identifier that allows us to determine the database and schema information */
  id?: string;
};

export type DataSchemaNodeType = "database" | "schema" | "table" | "column";

export class SchemaBuilder {
  #schema: DataSchemaNode[] = [];
  #tables: DataSchemaTable[];
  constructor(tables: DataSchemaTable[]) {
    this.#tables = tables;
  }

  build(): DataSchemaNode[] {
    const newSchema = [...this.#schema];
    // loop through all of the SchemaTable Rows
    this.#tables.forEach((table) => {
      // find the database node (create a new one if it's not there)
      const database =
        newSchema.find((db) => db.name === table.database) ||
        ({
          name: table.database,
          children: [],
          type: "database",
          comment: table.databaseComment,
        } as DataSchemaNode);
      // find the schema node (create a new one if it's not there)
      const schema =
        database.children.find((s) => s.name === table.schema) ||
        ({
          name: table.schema,
          children: [],
          type: "schema",
          comment: table.schemaComment,
        } as DataSchemaNode);
      // find the table node (create a new one if it's not there)
      const tableData =
        schema.children.find((t) => t.name === table.name) ||
        ({
          name: table.name,
          children: [],
          type: "table",
          comment: table.tableComment,
          index: table.database,
          id: table.id,
        } as DataSchemaNode);
      const columns = table.cols.map(
        (c) => ({ name: c.name, dataType: c.data_type, comment: c.comment, type: "column" } as DataSchemaNode)
      );
      // add columnData to tableData
      tableData.children = columns;

      // find and replace tableData
      const tableIndex = schema.children.findIndex((t) => t.name === tableData.name);
      tableIndex > -1 ? schema.children.splice(tableIndex, 1, tableData) : schema.children.push(tableData);

      // find and replace schema
      const schemaIndex = database.children.findIndex((s) => s.name === schema.name);
      schemaIndex > -1 ? database.children.splice(schemaIndex, 1, schema) : database.children.push(schema);

      // find and replace database
      const databaseIndex = newSchema.findIndex((d) => d.name === database.name);
      databaseIndex > -1 ? newSchema.splice(databaseIndex, 1, database) : newSchema.push(database);
    });

    return newSchema.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export type SchemaTableColumn = {
  id: string;
  name: string;
  data_type: string;
  comment: string;
};

export type DataSchemaTable = {
  id: string;
  schema: string | null;
  name: string | null;
  cols: SchemaTableColumn[];
  createdAt: Date;
  updatedAt: Date;
  database: string;
  tableComment: string | null;
  schemaComment: string | null;
  databaseComment: string | null;
};

export type FunctionArg = {
  name: string;
  type: string;
};

export type FunctionSchema = {
  database: string;
  schema: string;
  name: string;
  args: FunctionArg[];
  returnType: string;
  comment: string;
};

export const tablesRedisKey = "tables:all";
export const functionsRedisKey = "snowflake:functions:all";
