{
  "result": {
    "id": "f684f6c1-9e9e-4958-8643-43cbffb91455",
    "name": "logsfucker",
    "subdomain": "logsfucker.pages.dev",
    "domains": [
      "logsfucker.pages.dev"
    ],
    "build_config": {
      "destination_dir": "frontend/dist",
      "web_analytics_tag": null,
      "web_analytics_token": null
    },
    "deployment_configs": {
      "preview": {
        "env_vars": {},
        "d1_databases": {
          "DB": {
            "id": "253b544c-3a8f-4783-8f7f-47df2e6e0096"
          }
        },
        "fail_open": true,
        "always_use_latest_compatibility_date": false,
        "compatibility_date": "2025-11-10",
        "compatibility_flags": [],
        "build_image_major_version": 3,
        "usage_model": "standard"
      },
      "production": {
        "env_vars": {
          "ENVIRONMENT": {
            "type": "plain_text",
            "value": "production"
          }
        },
        "fail_open": true,
        "always_use_latest_compatibility_date": false,
        "compatibility_date": "2024-01-01",
        "compatibility_flags": [],
        "build_image_major_version": 3,
        "usage_model": "standard",
        "wrangler_config_hash": "5dc6b6e088fbd7c177959eac672d89779caa791920e4e972174dce582783309d"
      }
    },
    "latest_deployment": {
      "id": "e91028a4-a1d2-457b-83ac-a9b2e4c9b732",
      "short_id": "e91028a4",
      "project_id": "f684f6c1-9e9e-4958-8643-43cbffb91455",
      "project_name": "logsfucker",
      "environment": "production",
      "url": "https://e91028a4.logsfucker.pages.dev",
      "created_on": "2025-11-10T21:54:47.056459Z",
      "modified_on": "2025-11-10T21:54:50.157686Z",
      "latest_stage": {
        "name": "deploy",
        "started_on": null,
        "ended_on": "2025-11-10T21:54:50.157686Z",
        "status": "success"
      },
      "deployment_trigger": {
        "type": "ad_hoc",
        "metadata": {
          "branch": "main",
          "commit_hash": "4fad9b426b64622002de21081cafc52a4486b088",
          "commit_message": "fix: убрал D1 из wrangler.toml для UI binding",
          "commit_dirty": true
        }
      },
      "stages": [
        {
          "name": "queued",
          "started_on": "2025-11-10T21:54:47.056459Z",
          "ended_on": null,
          "status": "active"
        },
        {
          "name": "initialize",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "clone_repo",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "build",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "deploy",
          "started_on": null,
          "ended_on": "2025-11-10T21:54:50.157686Z",
          "status": "success"
        }
      ],
      "build_config": {
        "build_command": null,
        "destination_dir": "frontend/dist",
        "build_caching": null,
        "root_dir": null,
        "web_analytics_tag": null,
        "web_analytics_token": null
      },
      "env_vars": {
        "ENVIRONMENT": {
          "type": "plain_text",
          "value": "production"
        }
      },
      "compatibility_date": "2024-01-01",
      "compatibility_flags": [],
      "build_image_major_version": 3,
      "usage_model": "bundled",
      "aliases": null,
      "is_skipped": false,
      "production_branch": "main",
      "uses_functions": true
    },
    "canonical_deployment": {
      "id": "e91028a4-a1d2-457b-83ac-a9b2e4c9b732",
      "short_id": "e91028a4",
      "project_id": "f684f6c1-9e9e-4958-8643-43cbffb91455",
      "project_name": "logsfucker",
      "environment": "production",
      "url": "https://e91028a4.logsfucker.pages.dev",
      "created_on": "2025-11-10T21:54:47.056459Z",
      "modified_on": "2025-11-10T21:54:50.157686Z",
      "latest_stage": {
        "name": "deploy",
        "started_on": null,
        "ended_on": "2025-11-10T21:54:50.157686Z",
        "status": "success"
      },
      "deployment_trigger": {
        "type": "ad_hoc",
        "metadata": {
          "branch": "main",
          "commit_hash": "4fad9b426b64622002de21081cafc52a4486b088",
          "commit_message": "fix: убрал D1 из wrangler.toml для UI binding",
          "commit_dirty": true
        }
      },
      "stages": [
        {
          "name": "queued",
          "started_on": "2025-11-10T21:54:47.056459Z",
          "ended_on": null,
          "status": "active"
        },
        {
          "name": "initialize",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "clone_repo",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "build",
          "started_on": null,
          "ended_on": null,
          "status": "idle"
        },
        {
          "name": "deploy",
          "started_on": null,
          "ended_on": "2025-11-10T21:54:50.157686Z",
          "status": "success"
        }
      ],
      "build_config": {
        "build_command": null,
        "destination_dir": "frontend/dist",
        "build_caching": null,
        "root_dir": null,
        "web_analytics_tag": null,
        "web_analytics_token": null
      },
      "env_vars": {
        "ENVIRONMENT": {
          "type": "plain_text",
          "value": "production"
        }
      },
      "compatibility_date": "2024-01-01",
      "compatibility_flags": [],
      "build_image_major_version": 3,
      "usage_model": "bundled",
      "aliases": null,
      "is_skipped": false,
      "production_branch": "main",
      "uses_functions": true
    },
    "created_on": "2025-11-10T20:34:00.542769Z",
    "production_branch": "main",
    "production_script_name": "pages-worker--9044373-production",
    "preview_script_name": "pages-worker--9044373-preview",
    "uses_functions": true,
    "framework": "",
    "framework_version": ""
  },
  "success": true,
  "errors": [],
  "messages": []
}
