// Add this at the top
import { jest } from '@jest/globals';

export const sql = jest.fn().mockImplementation((strings, ...values) => {
  return {
    then: (fn: any) => {
      const result = { 
        rows: [], 
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      };
      return Promise.resolve(fn(result));
    }
  };
});

export const neon = {
  config: jest.fn(),
  sql: sql
};

export const types = {};

export default {
  sql,
  neon,
  types
};