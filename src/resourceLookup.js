/**
 * A map-like class that maps resource linkage objects {id: 1, type: "user"} to concrete resources with attributes and
 * relationships
 */
export default class ResourceLookup {

  /**
   * Constructs a new lookup map
   * @param {Object} response A JSON API response, in JSON format
   */
  constructor(response) {
    this.lookup = new Map();

    // If the response wasn't a JSON dictionary, we can't and don't need to build a lookup
    if (typeof response !== 'object')
      return;

    let resources;
    if (response.hasOwnProperty('included')) {
      resources = [ response.data, ...response.included ];
    } else {
      resources = [ response.data ];
    }

    // Iterate over each resource returned and put each in the lookup
    for (let entry of resources) {
      const key = this.getKey(entry);
      this.lookup.set(key, entry);
    }
  }

  /**
   * Calculates a hashable key for JSON API resources
   * @param resource A resource linkage object
   * @returns {string}
   */
  getKey(resource) {
    return `${resource.type}:${resource.id}`;
  }

  /**
   * Looks up a resource
   * @param resource A resource linkage object
   * @returns {Object}
   */
  get(resource) {
    // If we don't have included data for this resource, just return the Resource Linkage object, since that's still
    // useful
    if (this.has(resource)) {
      return this.lookup.get(this.getKey(resource));
    } else {
      return resource;
    }
  }

  /**
   * Returns true if the resource is in the lookup
   * @param resource
   * @returns {boolean}
   */
  has(resource) {
    return this.lookup.has(this.getKey(resource));
  }

  /**
   * Converts a JSON API data object (with id, type, and attributes fields) into a flattened object
   * @param {Object} response A JSON API data object
   */
  unwrapData(response) {
    // The base resource object
    const ret = Object.assign(
      {
        id: response.id
      },
      response.attributes
    );

    // Deal with relationships
    if (response.hasOwnProperty('relationships')) {
      ret.relationships = {};
      for (let relationName of Object.keys(response.relationships)) {
        let relation = response.relationships[relationName].data;
        if (Array.isArray(relation)) {
          ret.relationships[relationName] = relation.map(resource => this.unwrapData(this.get(resource)));
        } else {
          ret.relationships[relationName] = this.unwrapData(this.get(relation));
        }
      }
    }

    return ret;
  }
}
