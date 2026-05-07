module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/services"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1"
  }
};
