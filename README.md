# LUIS Test Framework Proof of Concept

This repo contains a proof of concept for automatically testing a LUIS IRS (intent recognition system) model. It consists of two components: component A uses a context free grammar (CFG) to expand grammar rules, resulting in the generation of utterances that can be used to test an IRS. Component B is capable of querying the IRS and asserting its performance. The framework can be used in multiple MLOps scenarios. For more details, please refer to the associated thesis paper which will be included in this repository soon.

# Prerequisites

If you only want to see some examples of how the CFG generates utterances, this is possible without an Azure / LUIS account. You only need:

* Node.js installed (preferably a recent version, with npm)
* A clone or download of the repository

If you want to conduct the framework and query LUIS using a model trained on the Frames dataset, in addition you need:

* A [LUIS](https://eu.luis.ai/) account. Creating a LUIS app may require an Azure account. If it is not desired to create such an account, it is only possible to generate some example utterances which would be queried against LUIS.
* A [Bing spell check](https://azure.microsoft.com/en-us/services/cognitive-services/spell-check/) resource in Azure. This **requires** an Azure account. It is also possible to execute the framework without it, but 'enabling' spell check will not have any effect.
* A copy of the [Frames](https://www.microsoft.com/en-us/research/project/frames-dataset) dataset.
* If you want to try the CI/CD pipelines, you must fork the project.

# Repository Overview

```
.github
└───workflows // CI/CD examples using Github Actions

example_experiment_output // Example of an Experiment run using the framework, including an R script for further analysis. Note that the R script uses some modules you may have to manually install.

framework // Folder containing the PoC framework 

luismodel // Project to parse Frames dataset and send its utterances to a LUIS app, also used by the CI/CD pipelines to promote a staging model to production
```

# Creation of the LUIS model

In order to use the framework, a published LUIS app with Frames data is necessary. To this end, the `luismodel` project can be used to parse the Frames dataset to LUIS.

1. In the LUIS portal, create a new LUIS app. Ensure that `Culture` is set to **English**. You can use a free starter key if desired. 

2. Download and move `frames.json` into `/luismodel/data/frames`

3. Browse into `/luismodel`
4.  In the LUIS portal in your created app, `Import version`, then select the `templateLuisModel.json` file in `/luismodel/deployment`. Ensure the new version is active. You can delete the default version which is unused.
5. Create `.env` in the `/luismodel` folder and fill this in according to `.env.example`.  The app ID should be visible in the URL when browsing through the app in the LUIS portal. The subscription key can be found in `Manage > Application Settings > Azure Resources`. Ideally you should use an authoring key for this.
6. Run `npm install`
7. Run `npm run buildmodel`. This can take a while. You should see warnings about unimplemented dialogue acts: this is as intended. The app will be published in staging automatically. Once this program exits, you're ready to use the framework.

# Framework Usage

The framework is a CLI program, supporting three scenarios as described below.

Before using the framework, browse into `/framework` . Then, do the following:

1. Run `npm install` ,
2. Build the framework using `npm run build`. You only have to do this once. 
3. Ensure that you create a `.env` file in the root of `/framework` which reflects `.env.example` if you are using the framework locally. Note the `APP_ID` and `SUBSCRIPTION_KEY` parameters in the `LUIS_QUERY_URL` variable. If you are using a CI/CD provider such as GitHub actions, the secrets should be [stored in a safe way](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets). `BING_SPELL_CHECK_SUBSCRIPTION_KEY` can be left empty if you do not have a Bing spell check resource, but in cases where spell check preprocessing is enabled it will have no effect. This subscription key can be found within the spell check resource in the Azure portal.

You can start the framework by running `node ./build/index.js`. As the framework is a CLI program, help concerning the required parameters is included. Concrete examples are described below.

## CI/CD

This scenario can be used to automatically test the LUIS model. It is the pinnacle of the test framework as this command is very customizable: many parameters can be passed to change the test runs to your liking, such as sample size, utterance complexity and more (see `node ./build/index.js cicd`).

This command but can be used with CI/CD providers. Included in this repository are two YML files compatible with GitHub Actions as a CI/CD provider as examples. These YML files automatically test a LUIS model using various test runs. If the model performs well enough, it is promoted from staging to production automatically. `ci.yml` is meant to succeed, whereas `failingCi.yml` will always fail to show that the framework can prevent an underperforming model from publication. You could run the framework as part of a testing pipeline before approving a model version for release, or run it routinely to monitor a production model's performance.

This command consumes LUIS, so make sure you do not set the sample sizes too large to prevent large costs.

## CFG Example

This scenario can be used to generate some example utterances to see what kind of utterances are generated by the CFG. This does not require any resources (LUIS or Azure).

Running `node ./build/index.js example` generates 10 example utterances. Both the normal form and the deviating form with noise will be printed to your console. In addition, an object containing the expected entities will be shown.

## Experiment

This scenario can be used to recreate the experimental conditions from the thesis paper. 

**WARNING** : this will use a **LOT** of LUIS consumption as the sample sizes are large: LUIS is queried tens of thousands of times to recreate the experiment. Unless you are aware of the consumption cost, do **NOT** run this command. For transparency, the samples and results generated by the experiment for the thesis paper can be found in the folder `/example_experiment_output`.