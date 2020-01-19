const rp = require('request-promise');
const Expect = require('./expect');
const Interaction = require('./interaction');
const helper = require('../helpers/helper');
const store = require('../helpers/store');

class Spec {

  constructor(server) {
    this.id = helper.getRandomId();
    this.server = server;
    this.interactions = new Map();
    this._request = {};
    this._response = {};
    this._expect = new Expect();
  }

  fetch() {
    this._request.resolveWithFullResponse = true;
    switch (this._request.method) {
      case 'GET':
        return rp.get(this._request);
      case 'POST':
        return rp.post(this._request);
      default:
        return rp.get(this._request);
    }
  }

  /**
   * Add as an interaction to the mock server
   * @param {object} rawInteraction - interaction details
   * @param {string} [rawInteraction.consumer] - name of the consumer
   * @param {string} [rawInteraction.provider] - name of the provider
   * @param {string} [rawInteraction.state] - state of the provider
   * @param {string} [rawInteraction.uponReceiving] - description of the request
   * @param {object} rawInteraction.withRequest - interaction request details
   * @param {string} rawInteraction.withRequest.method - request method
   * @param {string} rawInteraction.withRequest.path - request path
   * @param {object} [rawInteraction.withRequest.headers] - request headers
   * @param {object} [rawInteraction.withRequest.query] - request query
   * @param {object} [rawInteraction.withRequest.body] - request body
   * @param {object} rawInteraction.willRespondWith - interaction response details
   * @param {string} rawInteraction.willRespondWith.status - response status code
   * @param {string} [rawInteraction.willRespondWith.headers] - response headers
   * @param {object} [rawInteraction.willRespondWith.body] - response body
   * @example
   * await pactum
   *  .addInteraction({
   *    consumer: 'our-little-consumer',
   *    provider: 'project-provider',
   *    state: 'when there is a project with id 1',
   *    uponReceiving: 'a request for project 1',
   *    withRequest: {
   *      method: 'GET',
   *      path: '/api/projects/1'
   *    },
   *    willRespondWith: {
   *      status: 200,
   *      headers: {
   *        'Content-Type': 'application/json'
   *      },
   *      body: {
   *        id: 1,
   *        name: 'fake'
   *      }
   *    }
   *  })
   *  .get('https://jsonplaceholder.typicode.com/posts')
   *  .expectStatus(200)
   *  .expectJsonLike({
   *    userId: 1,
   *    id: 1
   *   })
   *  .toss();
   */
  addInteraction(rawInteraction) {
    const interaction = new Interaction(rawInteraction);
    this.interactions.set(interaction.id, interaction);
    return this;
  }

  /**
   * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
   * @param {string} url - HTTP url
   * @example
   * await pactum
   *  .get('https://jsonplaceholder.typicode.com/posts')
   *  .withQuery('postId', 1)
   *  .expectStatus(200)
   *  .expectJsonLike({
   *    userId: 1,
   *    id: 1
   *   })
   *  .toss();
   */
  get(url) {
    this._request.url = url;
    this._request.method = 'GET';
    return this;
  }

  /**
   * The HEAD method asks for a response identical to that of a GET request, but without the response body.
   * @param {string} url - HTTP url
   */
  head(url) {
    this._request.url = url;
    this._request.method = 'HEAD';
    return this;
  }

  /**
   * The OPTIONS method is used to describe the communication options for the target resource.
   * @param {string} url - HTTP url
   */
  options(url) {
    this._request.url = url;
    this._request.method = 'OPTIONS';
    return this;
  }

  /**
   * The PATCH method is used to apply partial modifications to a resource.
   * @param {string} url - HTTP url
   * @example
   * await pactum
   *  .patch('https://jsonplaceholder.typicode.com/posts/1')
   *  .withJson({
   *    title: 'foo'
   *  })
   *  .expectStatus(200)
   *  .toss();
   */
  patch(url) {
    this._request.url = url;
    this._request.method = 'PATCH';
    return this;
  }

  /**
   * The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
   * @param {string} url - HTTP url
   * @example
   * await pactum
   *  .post('https://jsonplaceholder.typicode.com/posts')
   *  .withJson({
   *    title: 'foo',
   *    body: 'bar',
   *    userId: 1
   *  })
   *  .expectStatus(201)
   *  .toss();
   */
  post(url) {
    this._request.url = url;
    this._request.method = 'POST';
    return this;
  }

  /**
   * The PUT method replaces all current representations of the target resource with the request payload.
   * @param {string} url - HTTP url
   * @example
   * await pactum
   *  .put('https://jsonplaceholder.typicode.com/posts/1')
   *  .withJson({
   *    id: 1,
   *    title: 'foo',
   *    body: 'bar',
   *    userId: 1
   *  })
   *  .expectStatus(200)
   *  .toss();
   */
  put(url) {
    this._request.url = url;
    this._request.method = 'PUT';
    return this;
  }

  /**
   * The DELETE method deletes the specified resource.
   * @param {string} url - HTTP url
   * @example
   * await pactum
   *  .delete('https://jsonplaceholder.typicode.com/posts/1')
   *  .expectStatus(200)
   *  .toss();
   */
  delete(url) {
    this._request.url = url;
    this._request.method = 'DELETE';
    return this;
  }

  withQuery(key, value) {
    if (this._request.qs === undefined) {
      this._request.qs = {};
    }
    this._request.qs[key] = value;
    return this;
  }

  withJson(json) {
    this._request.json = json;
    return this;
  }

  withHeaders(headers) {
    this._request.headers = headers;
    return this
  }

  expectStatus(statusCode) {
    this._expect.statusCode = statusCode;
    return this;
  }

  expectHeader(header, value) {
    this._expect.headers.push({
      key: header,
      value
    });
    return this;
  }

  expectHeaderContains(header, value) {
    this._expect.headerContains.push({
      key: header,
      value
    });
    return this;
  }

  expectBody(body) {
    this._expect.body = body;
    return this;
  }

  expectBodyContains(value) {
    this._expect.bodyContains.push(value);
    return this;
  }

  expectJson(json) {
    this._expect.json.push(json);
    return this;
  }

  expectJsonLike(json) {
    this._expect.jsonLike.push(json);
    return this;
  }

  expectJsonQuery(path, value) {
    this._expect.jsonQuery.push({path, value});
    return this;
  }

  async toss() {
    for (let [id, interaction] of this.interactions) {
      this.server.addInteraction(id, interaction);
    }
    try {
      this._response = await this.fetch();
    } catch (error) {
      this._response = error;
    }
    for (let [id, interaction] of this.interactions) {
      store.addInteraction(interaction);
      this.server.removeInteraction(interaction.port, id);
    }
    this._response.json = helper.getJson(this._response.body);
    this._expect.validateInteractions(this.interactions);
    this._expect.validate(this._response);
  }

}

module.exports = Spec;