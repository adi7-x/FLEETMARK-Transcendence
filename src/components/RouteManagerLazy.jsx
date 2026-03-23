import React from 'react';
import { stations } from '../services/api';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const RouteManager = React.lazy(() => import('./RouteManager'));

export default RouteManager;