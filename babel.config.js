module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: true,
          allowUndefined: true,
        },
      ],
      "react-native-reanimated/plugin",
      "@babel/plugin-transform-export-namespace-from",
    ],
  };
};
