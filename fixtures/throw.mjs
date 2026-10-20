export default {
  rules: {
    throw: {
      given: "$",
      then: {
        function: () => {
          throw new Error("thrown by test");
        },
      },
    },
  },
};
