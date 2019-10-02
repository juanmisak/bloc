import * as _ from "lodash";

import * as semver from "semver";
import { window, env, Uri } from "vscode";
import { getPubspecDependencies } from ".";

export function analyzeDependencies() {
  const dependenciesToAnalyze = [
    {
      name: "equatable",
      version: "^0.6.0",
      actions: [
        {
          name: "Open Migration Guide",
          callback: () => {
            env.openExternal(
              Uri.parse(
                "https://github.com/felangel/equatable/blob/master/doc/migration_guides/migration-0.6.0.md"
              )
            );
          }
        }
      ]
    },
    { name: "bloc", version: "^0.15.0", actions: [] },
    { name: "flutter_bloc", version: "^0.21.0", actions: [] }
  ];

  const dependencies = getPubspecDependencies();

  for (let i = 0; i < dependenciesToAnalyze.length; i++) {
    const dependency = dependenciesToAnalyze[i];
    if (_.has(dependencies, dependency.name)) {
      const dependencyVersion = _.get(dependencies, dependency.name, "latest");
      if (dependencyVersion === "latest") continue;
      if (dependencyVersion == null) continue;
      if (typeof dependencyVersion !== "string") continue;
      const minVersion = _.get(
        semver.minVersion(dependencyVersion),
        "version",
        "0.0.0"
      );
      if (!semver.satisfies(minVersion, dependency.version)) {
        window
          .showWarningMessage(
            `This workspace contains an unsupported version of ${dependency.name}. Please update to ${dependency.version}.`,
            ...dependency.actions.map(action => action.name)
          )
          .then(invokedAction => {
            const action = dependency.actions.find(
              action => action.name === invokedAction
            );
            if (!_.isNil(action)) {
              action.callback();
            }
          });
      }
    }
  }
}