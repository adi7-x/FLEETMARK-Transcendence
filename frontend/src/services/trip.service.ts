// @ts-nocheck
// ── Trip service — CRUD + lifecycle actions ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { Trip, TripCreate, TripUpdate, TripStartResponse, TripEndResponse } from '../types/api';

export async function getTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>(API_ENDPOINTS.trips.list);
  return data;
}

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await api.get<Trip>(API_ENDPOINTS.trips.detail(id));
  return data;
}

export async function createTrip(payload: TripCreate): Promise<Trip> {
  const { data } = await api.post<Trip>(API_ENDPOINTS.trips.list, payload);
  return data;
}

export async function updateTrip(id: number, payload: TripUpdate): Promise<Trip> {
  const { data } = await api.patch<Trip>(API_ENDPOINTS.trips.detail(id), payload);
  return data;
}

export async function deleteTrip(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.trips.detail(id));
}

// ── Trip lifecycle ──

export async function startTrip(id: number): Promise<TripStartResponse> {
  const { data } = await api.post<TripStartResponse>(API_ENDPOINTS.trips.start(id));
  return data;
}

export async function endTrip(id: number): Promise<TripEndResponse> {
  const { data } = await api.post<TripEndResponse>(API_ENDPOINTS.trips.end(id));
  return data;
}
