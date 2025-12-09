// Cloudflare GraphQL Analytics Queries

export const REALTIME_QUERY = `
  query Realtime($zone: String!, $from: String!, $to: String!, $limit: Int!) {
    viewer {
      zones(filter: {zoneTag: $zone}) {
        httpRequests1mGroups(
          limit: $limit
          orderBy: [datetime_DESC]
          filter: {datetime_geq: $from, datetime_leq: $to}
        ) {
          dimensions {
            datetimeMinute
            clientCountryName
            edgeResponseStatus
            clientRequestPath
          }
          sum {
            requests
            cachedRequests
            threats
            bytes
          }
        }
      }
    }
  }
`;

export const TRAFFIC_OVERVIEW_QUERY = `
  query TrafficOverview($zone: String!, $from: String!, $to: String!) {
    viewer {
      zones(filter: {zoneTag: $zone}) {
        httpRequests1hGroups(
          limit: 24
          orderBy: [datetime_DESC]
          filter: {datetime_geq: $from, datetime_leq: $to}
        ) {
          dimensions {
            datetime
          }
          sum {
            requests
            cachedRequests
            threats
            bytes
            pageViews
          }
          uniq {
            uniques
          }
        }
      }
    }
  }
`;
