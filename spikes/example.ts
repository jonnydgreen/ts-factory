import { Context } from '../context';
import { API } from '../api';
import { GetDataResponse, ServiceError } from '../example.type';

export class Service {
  #api: API;

  constructor() {
    this.#api = new API();
  }

  /**
   * Get ze data.
   */
  public async getData(context: Context): GetDataResponse {
    let response: GetDataResponse;

    try {
      // Get the data
      response = await this.#api.getData(context);
    } catch (error) {
      throw new ServiceError({ message: 'Some message', error });
    }

    return response;
  }
}
