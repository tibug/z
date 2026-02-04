import apiClient from './client';
import type { 
  OrganizationListItemDto, 
  OrganizationDetailDto, 
  OrganizationSearchRequest,
  PagedResult 
} from '../types/models';

export const organizationsApi = {
  search: async (params: OrganizationSearchRequest): Promise<PagedResult<OrganizationListItemDto>> => {
    const response = await apiClient.get<PagedResult<OrganizationListItemDto>>('/organizations', { 
      params 
    });
    return response.data;
  },

  searchPost: async (request: OrganizationSearchRequest): Promise<PagedResult<OrganizationListItemDto>> => {
    const response = await apiClient.post<PagedResult<OrganizationListItemDto>>(
      '/organizations/search', 
      request
    );
    return response.data;
  },

  getById: async (id: number): Promise<OrganizationDetailDto> => {
    const response = await apiClient.get<OrganizationDetailDto>(`/organizations/${id}`);
    return response.data;
  },

  getByPermalink: async (permalink: string): Promise<OrganizationDetailDto> => {
    const response = await apiClient.get<OrganizationDetailDto>(`/organizations/by-permalink/${permalink}`);
    return response.data;
  },
};
