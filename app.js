let servicesProtheus = null
let servicesAux = []
let count = 0
let qtdAlunos = parseInt(process.env.SERVICE_COUNT_APPSERVER) || 1
let portTCP = parseInt(process.env.PORT_TCP) || 1234
let auxPortTCP = portTCP
let portWEB = parseInt(process.env.PORT_WEB_APP) || 8080
let auxPortWEB = portWEB
let portREST = process.env.PORT_REST || 8082
let { base } = require('./baseServices')
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const compose = require('docker-compose')
const args = process.argv


while (count < qtdAlunos) {
  
    count++
    auxPortTCP++
    auxPortWEB++

    if (auxPortWEB === portREST) {
      auxPortWEB++
    } 

    servicesProtheus = { [`aluno-${count}`]: new Object() }
    
    servicesProtheus[`aluno-${count}`][`image`] = "marllonfernandes/protheus:p12127"
    servicesProtheus[`aluno-${count}`][`container_name`] = `aluno-${count}`
    servicesProtheus[`aluno-${count}`][`depends_on`] = ["dbaccess"]
    
    servicesProtheus[`aluno-${count}`][`environment`] = new Object()
    servicesProtheus[`aluno-${count}`][`environment`][`LICENSECLIENT_SERVER`] = process.env.DATABASE_NO_RECORDS.toLocaleLowerCase() === 'true' ? "license" : process.env.LICENSE
    servicesProtheus[`aluno-${count}`][`environment`][`LICENSECLIENT_PORT`] = 5555
    servicesProtheus[`aluno-${count}`][`environment`][`WEBAPP`] = 1

    // CONFIGURACAO REST
    if (process.env.REST.toLocaleLowerCase() === 'true') {

      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP1`] = "[HTTPV11]ENABLE=1"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP2`] = "[HTTPV11]SOCKETS=HTTPREST"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP3`] = `[HTTPREST]PORT=${portREST}`
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP4`] = "[HTTPREST]IPSBIND="
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP5`] = "[HTTPREST]URIS=HTTPURI"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP6`] = "[HTTPREST]SECURITY=1"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP7`] = "[HTTPURI]URL=/rest"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP8`] = "[HTTPURI]PrepareIn=ALL"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP9`] = "[HTTPURI]Instances=2,2"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP10`] = "[HTTPURI]CORSEnable=1"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP11`] = "[HTTPURI]AllowOrigin=*"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP12`] = "[HTTPJOB]MAIN=HTTP_START"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP13`] = "[HTTPJOB]ENVIRONMENT=environment"
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP14`] = "[ONSTART]jobs=HTTPJOB"           
      servicesProtheus[`aluno-${count}`][`environment`][`APPSERVER_REST_HTTP15`] = "[ONSTART]RefreshRate=30" 
    }
    
    servicesProtheus[`aluno-${count}`][`ports`] = [`${auxPortTCP}:${portTCP}`,`${auxPortWEB}:${portWEB}`, `${portREST}:${portREST}`] 

    servicesAux.push(servicesProtheus)
    
}

servicesProtheus = Object.assign(...servicesAux)

services = Object.assign(base.services, servicesProtheus)

const doc = new YAML.Document()
doc.contents = { version : "3.0", services: services }

// console.log(doc.toString())
handle()

async function handle() {
  fs.writeFileSync('docker-compose.yml', doc.toString())

  if (args[2] == 'down') {
    compose.down({ cwd: path.join(__dirname), log: true }).then(
      () => {
        console.log('Parando serviços...')
      },
      (err) => {
        console.log(err.message)
      }
    )
  }

  if (args[2] == 'up') {
    compose.upAll({ cwd: path.join(__dirname), log: true }).then(
      () => {
        console.log('Iniciando serviços...')
      },
      (err) => {
        console.log(err.message)
      }
    )
  }  
}