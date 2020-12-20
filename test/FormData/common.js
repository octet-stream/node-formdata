const {Readable} = require("stream")

const Blob = require("fetch-blob")
const req = require("supertest")
const pq = require("proxyquire")
const test = require("ava")

const {spy} = require("sinon")
const {readFile, createReadStream, statSync} = require("promise-fs")
const {ReadableStream} = require("web-streams-polyfill/ponyfill")

const boundary = require("../../lib/util/boundary")
const FormData = require("../../lib/FormData")

const read = require("../__helper__/read")
const File = require("../__helper__/File")
const count = require("../__helper__/count")
const server = require("../__helper__/server")

test("The stream accessor returns a Readable stream", t => {
  const fd = new FormData()

  t.true(fd.stream instanceof Readable)
})

test("Boundary accessor returns a correct value", t => {
  const spyondary = spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": spyondary
  })

  const fd = new MockedFD()

  const actual = fd.boundary

  t.is(actual, `NodeJSFormDataStreamBoundary${spyondary.lastCall.returnValue}`)
})

test("Returns a correct headers from the .headers accessor", t => {
  const spyondary = spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": spyondary
  })

  const fd = new MockedFD()

  const actual = fd.headers

  const expected = {
    "Content-Type": (
      "multipart/form-data; boundary=" +
      `NodeJSFormDataStreamBoundary${spyondary.lastCall.returnValue}`
    )
  }

  t.deepEqual(actual, expected)
})

test("Returns a correct string on .toString() call", t => {
  const fd = new FormData()

  t.is(String(fd), "[object FormData]")
})

test("Returns a correct string on .inspect() call", t => {
  const fd = new FormData()

  t.is(fd.inspect(), "FormData")
})

test("Have no fields by default", t => {
  const fd = new FormData()

  t.is(count(fd), 0)
})

test("Applies initial fields from a collection", t => {
  const fields = [
    {
      name: "nick",
      value: "Rarara"
    },
    {
      name: "eyes",
      value: "blue"
    }
  ]

  const fd = new FormData(fields)

  t.is(count(fd), 2)
  t.is(fd.get("nick"), "Rarara")
  t.is(fd.get("eyes"), "blue")
})

test("Ignores invalid initial fields", t => {
  const fields = [
    {
      name: "nick",
      value: "Rarara"
    },
    null,
    ["some array field"],
    {
      name: "eyes",
      value: "blue"
    }
  ]

  const fd = new FormData(fields)

  t.is(count(fd), 2)
  t.is(fd.get("nick"), "Rarara")
  t.is(fd.get("eyes"), "blue")
})

test("Correctly sets a filed to FormData request body", async t => {
  const fd = new FormData()

  const field = "Hello, World!"

  fd.set("field", field)

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.is(body.field, field)
})

test("Correctly sets a file to FormData request body", async t => {
  const fd = new FormData()

  fd.set("file", createReadStream(__filename))

  const file = await readFile(__filename, "utf-8")

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.is(body.file, String(file))
})

test(
  "Correctly sets field AND file together to FormData request body",
  async t => {
    const fd = new FormData()

    const field = "Hello, World!"

    fd.set("field", field)

    fd.set("file", createReadStream(__filename))

    const expectedFile = await readFile(__filename)

    const data = await read(fd)

    const res = await req(server())
      .post("/")
      .set("content-type", fd.headers["Content-Type"])
      .send(data)

    t.is(res.body.field, field)

    // I don't know why, but sometimes test fails here because file is empty -_-
    t.is(res.body.file, String(expectedFile))
  }
)

test("Correctly sets Blob fields", async t => {
  const fd = new FormData()

  const expected = "Some text"

  fd.set("blob", new Blob([expected], {type: "text/plain"}), "file.txt")

  const data = await read(fd.stream)

  const {body} = await req(server())
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(data)

  t.is(body.blob, expected)
})

test("Correctly sets File fields", async t => {
  const fd = new FormData()

  const expected = "Some text"

  fd.set("file", new File([expected], "file.txt", {type: "text/plain"}))

  const data = await read(fd.stream)

  const {body} = await req(server())
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(data)

  t.is(body.file, expected)
})

test("Allows to use ReadableStream as a field", async t => {
  const expected = "My hovercraft is full of eels"

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(expected)
      controller.close()
    }
  })

  const fd = new FormData()

  fd.set("field", readable)

  const data = await read(fd.stream)

  const {body} = await req(server())
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(data)

  t.is(body.field, expected)
})

test(
  "The filename parameter has priority over the ReadStream#path value",
  t => {
    const expected = "some-file.js"

    const fd = new FormData()

    const stream = createReadStream(__filename)

    fd.set("stream", stream, expected, {size: statSync(__filename).size})

    t.is(fd.get("stream").name, expected)
  }
)
