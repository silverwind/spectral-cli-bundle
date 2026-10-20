import {pattern} from "@stoplight/spectral-functions"; // eslint-disable-line import-x/no-extraneous-dependencies -- resolved by spectral's ruleset bundler

export default (input, _options, context) => pattern(input, {match: "^[a-z]"}, context);
