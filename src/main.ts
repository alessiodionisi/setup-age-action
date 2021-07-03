import os from "os"
import path from "path"

import * as core from "@actions/core"
import * as github from "@actions/github"
import * as toolCache from "@actions/tool-cache"
import * as semver from "semver"

function getArch(arch: string) {
  const mappings: Record<string, string> = {
    x64: "amd64",
  }

  return mappings[arch] || arch
}

async function getAgePath(version: string): Promise<string> {
  const foundCachePath = toolCache.find("age", version)
  if (foundCachePath) {
    core.info(`Found age in cache at ${foundCachePath}`)
    return foundCachePath
  }

  const platform = os.platform()
  const arch = getArch(os.arch())
  const downloadUrl = `https://github.com/FiloSottile/age/releases/download/${version}/age-${version}-${platform}-${arch}.tar.gz`

  core.info(`Downloading age version ${version} from ${downloadUrl}`)
  const downloadPath = await toolCache.downloadTool(downloadUrl)
  core.info(`Successfully downloaded age to ${downloadPath}`)

  core.info("Extracting age...")
  const extractPath = await toolCache.extractTar(downloadPath)
  core.info(`Successfully extracted age to ${extractPath}`)

  core.info("Adding age to the cache...")
  const cachePath = await toolCache.cacheDir(extractPath, "age", version)
  core.info(`Successfully cached age to ${cachePath}`)

  return cachePath
}

async function findRelease(
  token: string,
  versionSpec: string
): Promise<string | undefined> {
  const octokit = github.getOctokit(token)

  core.info(`Fetching age releases...`)
  const releases = await octokit.rest.repos.listReleases({
    owner: "FiloSottile",
    repo: "age",
  })

  for (const release of releases.data) {
    if (versionSpec == "") {
      core.info(`Satisfied version is ${release.tag_name}`)
      return release.tag_name
    } else {
      if (semver.satisfies(release.tag_name, versionSpec)) {
        core.info(`Satisfied version is ${release.tag_name}`)
        return release.tag_name
      }
    }
  }
}

async function main() {
  const token = core.getInput("token")

  try {
    const versionSpec = core.getInput("version")

    const version = await findRelease(token, versionSpec)
    if (!version) {
      if (versionSpec == "") {
        core.setFailed(`Unable to find latest version`)
      } else {
        core.setFailed(`Unable to satisfy version ${versionSpec}`)
      }

      return
    }

    core.info(`Setup age version ${version}`)

    const agePath = await getAgePath(version)
    core.addPath(path.join(agePath, "age"))
    core.info("Added age to the path")
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
