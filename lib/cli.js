import _ from 'lodash';
import fs from 'fs';
import program from 'commander';
import path from 'path';
import checkEnv from 'check-env';
import stripJsonComments from 'strip-json-comments';
import * as helpers from './helpers';
import { ConfigurationError } from './errors';
import { version } from '../package.json';

function readJSONConfig(filePath) {
  const configFile = fs.readFileSync(filePath, { encoding: 'utf8' });
  try {
    return JSON.parse(stripJsonComments(configFile));
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new ConfigurationError('The configuration file contains invalid JSON');
    } else {
      throw err;
    }
  }
}

function run() {
  program
    .version(version)
    .option('-c, --config <path>',
      'Sets the path to the config file, otherwise read from the env variable CONFIG_FILE.'
    )
    .option('-t, --token <path>',
      'path to tokenfile'
    )
    .parse(process.argv);

  // If no config option is given, try to use the env variable:
  if (!program.config) checkEnv(['CONFIG_FILE']);
  else process.env.CONFIG_FILE = program.config;

  const completePath = path.resolve(process.cwd(), process.env.CONFIG_FILE);
  const config = _.endsWith(process.env.CONFIG_FILE, '.js') ?
    require(completePath) : readJSONConfig(completePath);
  // yolo
  if (program.token){
    config.token = readJSONConfig(program.token);
  }
  helpers.createBots(config);
}

export default run;
