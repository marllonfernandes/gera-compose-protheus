let env_postgres = {
  "environment": {
    "POSTGRES_USER": "postgres",
    "POSTGRES_PASSWORD": "postgres"
  }
}

let license = {
  "license": {
    "image": "marllonfernandes/license:latest",
    "container_name": "license",
    "ports": [
      "5555:5555"
    ]
  }
}

let base = {

  "version": "3.0",
  "services": {
    "postgres": {
      "image": `marllonfernandes/postgres:p12127${process.env.DATABASE_NO_RECORDS.toLocaleLowerCase() === 'true' ? '-zerada' : ''}`,
      "container_name": "postgres",
      "ports": [
        "5432:5432"
      ]
    },
    "dbaccess": {
      "image": "marllonfernandes/dbaccess:latest",
      "container_name": "dbaccess",
      "depends_on": ["postgres"],
      "environment": {
        "LICENSECLIENT_SERVER": process.env.DATABASE_NO_RECORDS.toLocaleLowerCase() === 'true' ? "license" : process.env.LICENSE,
        "POSTGRES_DATABASE": process.env.DATABASE_NO_RECORDS.toLocaleLowerCase() === 'true' ? "protheus" : "p12127mntdbexp",
        "POSTGRES_PORT": 5432,
        "DBACCESS_POSTGRES_CLIENTLIBRARY": "[POSTGRES]CLIENTLIBRARY=/usr/lib/x86_64-linux-gnu/libodbc.so.2",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASS": "postgres"
      },
      "ports": [
        "7890:7890"
      ]
    }
  }
}

if (process.env.DATABASE_NO_RECORDS.toLocaleLowerCase() === 'true') {

  Object.assign(base.services.postgres, env_postgres)
  Object.assign(base.services, license)

}

module.exports.base = base
