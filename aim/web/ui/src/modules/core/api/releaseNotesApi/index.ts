import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { IReleaseNote } from './types';

const api = new NetworkService(`${ENDPOINTS.RELEASE_NOTES.BASE}`);

/**
 * function fetchReleaseNotes
 * this call is used for fetching release notes list.
 * @returns {Promise<IReleaseNote[]>}
 */
async function fetchReleaseNotes(): Promise<IReleaseNote[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.RELEASE_NOTES.GET)).body;
}

/**
 * function fetchLatestRelease
 * this call is used for fetching latest release note.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchLatestRelease(): Promise<IReleaseNote> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/latest}`))
    .body;
}

/**
 * function fetchLatestReleaseById
 * this call is used for fetching release note by id.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchReleaseById(id: string): Promise<IReleaseNote> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/${id}}`))
    .body;
}

/**
 * function fetchLatestReleaseByTagName
 * this call is used for fetching release note by tag name.
 * @returns {Promise<IReleaseNote>}
 */

async function fetchReleaseByTagName(tagName: string): Promise<IReleaseNote> {
  return (
    await api.makeAPIGetRequest(
      `${ENDPOINTS.RELEASE_NOTES.GET}${ENDPOINTS.RELEASE_NOTES.GET_BY_TAG_NAME}/${tagName}`,
    )
  ).body;
}

export {
  fetchReleaseNotes,
  fetchLatestRelease,
  fetchReleaseById,
  fetchReleaseByTagName,
};
