import chalk from 'chalk';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { resolve } from 'path';
import { RuleSetRule, ProgressPlugin, optimize } from 'webpack';

export function getEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const develop = env === 'development';
  const production = env === 'production';

  return {
    develop,
    production,
  };
}

export function getPlugins(plugins: Array<any>, progress: boolean, production: boolean) {
  const otherPlugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ];

  if (progress) {
    otherPlugins.push(
      new ProgressPlugin((percent, msg) => {
        percent = Math.floor(percent * 100);
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);

        if (percent !== undefined) {
          process.stdout.write(' (');

          for (let i = 0; i <= 100; i += 10) {
            if (i <= percent) {
              process.stdout.write(chalk.greenBright('#'));
            } else {
              process.stdout.write('#');
            }
          }

          process.stdout.write(`) ${percent}% : `);
          process.stdout.write(`${chalk.cyanBright(msg)}`);

          if (percent === 100) {
            process.stdout.write(`${chalk.cyanBright('Complilation completed\n')}`);
          }
        }
      }),
    );
  }

  if (production) {
    otherPlugins.push(new optimize.OccurrenceOrderPlugin(true));
  }

  return plugins.concat(otherPlugins);
}

export function getStyleLoader() {
  return process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader;
}

export function getRules(baseDir: string): Array<RuleSetRule> {
  const styleLoader = getStyleLoader();
  const nodeModules = resolve(baseDir, 'node_modules');

  return [
    {
      test: /\.(png|jpe?g|gif|bmp|avi|mp4|mp3|svg|ogg|webp|wav)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            esModule: false,
          },
        },
      ],
    },
    {
      test: /\.s[ac]ss$/i,
      use: [styleLoader, 'css-loader', 'sass-loader'],
    },
    {
      test: /\.css$/i,
      use: [styleLoader, 'css-loader'],
    },
    {
      test: /\.m?jsx?$/i,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      ],
      exclude: nodeModules,
    },
    {
      test: /\.tsx?$/i,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
    {
      test: /\.codegen$/i,
      use: ['parcel-codegen-loader'],
    },
    {
      test: /\.js$/i,
      use: ['source-map-loader'],
      exclude: nodeModules,
      enforce: 'pre',
    },
  ];
}
