const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  result = null;
  const { status, search_q = "", priority } = request.query;
  let getQuery = null;

  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;

    case hasPriorityProperty(request.query):
      getQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  result = await db.all(getQuery);
  response.send(result);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
 SELECT *
 FROM TODO
 WHERE id=${todoId};`;

  const result = await db.get(getQuery);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const postQuery = `
    INSERT INTO todo (id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}');
    `;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteQuery = `
    DELETE FROM todo
    WHERE id=${todoId};`;

  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateQuery = null;
  let result = null;

  const { todo, status, priority } = request.body;

  const updateStatus = (requestBody) => {
    return requestBody.status !== undefined;
  };

  const updateTodo = (requestBody) => {
    return requestBody.todo !== undefined;
  };

  const updatePriority = (requestBody) => {
    return requestBody.priority !== undefined;
  };

  switch (true) {
    case updateStatus(request.body):
      result = "Status Updated";
      updateQuery = `
        UPDATE todo
        SET
        status='${status}'
        WHERE id=${todoId}
        ;`;
      break;
    case updateTodo(request.body):
      result = "Todo Updated";
      updateQuery = `
        UPDATE todo
        SET
        todo='${todo}'
        WHERE id=${todoId}
        ;`;
      break;

    case updatePriority(request.body):
      result = "Priority Updated";
      updateQuery = `
        UPDATE todo
        SET
        priority='${priority}'
        WHERE id=${todoId}
        ;`;
      break;
  }

  await db.run(updateQuery);
  response.send(result);
});

module.exports = app;
