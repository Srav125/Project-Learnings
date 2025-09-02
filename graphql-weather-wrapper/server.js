const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");

// 1. Define Schema
const typeDefs = gql`
  type Weather {
  temperature: String
  wind: String
  description: String
  forecast: [Forecast]
}

type Forecast {
  day: String
  temperature: String
  wind: String
}

type Query {
  getWeather(city: String!): Weather
}`;

// 2. Define Resolvers
const resolvers = {
  Query: {
    async getWeather(_, { city }) {
      try {
        const url = `https://goweather.xyz/weather/${city}`;
        const response = await axios.get(url);

        // Ensure only raw JSON goes in
        const data = response.data || {};

        return {
          temperature: data.temperature || null,
          wind: data.wind || null,
          description: data.description || null,
          forecast: Array.isArray(data.forecast)
            ? data.forecast.map(f => ({
                day: f.day,
                temperature: f.temperature,
                wind: f.wind
              }))
            : []
        };
      } catch (error) {
        console.error("API error:", error.message);
        throw new Error("Failed to fetch weather data");
      }
    }
  }
};


// 3. Start Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
