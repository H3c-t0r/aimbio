import API from '../api';
import { IApiRequest } from 'types/services/services';

const endpoints = {
  GET_IMAGES: 'runs/search/images',
  GET_IMAGES_BY_URIS: 'runs/images/get-batch',
};

function getImagesExploreData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_IMAGES, params);
}

// function getImagesByURIs(body: string[]) {
//   return API.post(endpoints.GET_IMAGES_BY_URIS, body, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// }

function getImagesByURIs(body: string[]): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(endpoints.GET_IMAGES_BY_URIS, body, {
    method: 'POST',
  });
}

const imagesExploreService = {
  endpoints,
  getImagesExploreData,
  getImagesByURIs,
};

export default imagesExploreService;
