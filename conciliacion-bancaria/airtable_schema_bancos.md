[
    {
        "body": {
            "tables": [
                {
                    "id": "tblWnB9SCfCFoXzfW",
                    "name": "deals",
                    "primaryFieldId": "fldJ77NBAlUHSyFmY",
                    "fields": [
                        {
                            "type": "multilineText",
                            "id": "fldJ77NBAlUHSyFmY",
                            "name": "indexDeal"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel3ea0rOkVhCeoKd",
                                        "name": "B2B2C",
                                        "color": "orangeBright"
                                    },
                                    {
                                        "id": "sel06aaNR1Av57Ak2",
                                        "name": "B2C",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selDf2f96D7Pet9qZ",
                                        "name": "b2b2c",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selxtMiM0DjzmBBFz",
                                        "name": "b2c",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fld7hwcN9ZluC4ZH4",
                            "name": "canal de entrada"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldOnUYgysh29VHMe"
                            },
                            "id": "fldH0VDmRaOLBJwdt",
                            "name": "linkBalance"
                        },
                        {
                            "type": "checkbox",
                            "options": {
                                "icon": "check",
                                "color": "greenBright"
                            },
                            "id": "fldAyCWlvUpYiH9gc",
                            "name": "crearBalance"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldZE4Q0citWseonB",
                            "name": "alquiler mensual"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldCulx3TI4WbvVUF",
                            "name": "numero poliza"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldX7LYShpPYbTi7i",
                            "name": "fecha fin poliza"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "seljaaoJiA7n9vNuB",
                                        "name": "pendiente",
                                        "color": "yellowBright"
                                    },
                                    {
                                        "id": "selAZalZCPtOpgRzg",
                                        "name": "firmado",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "selpj4ZkEPZbj2LjN",
                                        "name": "cancelada",
                                        "color": "redBright"
                                    }
                                ]
                            },
                            "id": "fld74RowcmOZGGwjN",
                            "name": "estado poliza"
                        },
                        {
                            "type": "multipleAttachments",
                            "options": {
                                "isReversed": false
                            },
                            "id": "fldOWMoUj9PcRYoCk",
                            "name": "poliza documento"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selRtN6Wbqmn4f0be",
                                        "name": "Con franquicia",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "sel1ys2e8aNzW9U30",
                                        "name": "Sin franquicia",
                                        "color": "tealBright"
                                    },
                                    {
                                        "id": "sel24Ay28Dhl5WI2p",
                                        "name": "Suministros",
                                        "color": "yellowBright"
                                    }
                                ]
                            },
                            "id": "fldbPGPyt4Iy9vSBY",
                            "name": "tipo poliza"
                        },
                        {
                            "type": "checkbox",
                            "options": {
                                "icon": "check",
                                "color": "greenBright"
                            },
                            "id": "fldkdJXBwtElGqNtu",
                            "name": "checkPolizaDocumento"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldR4mD8TOypHYleq",
                            "name": "driveDocIDPoliza"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldPC4OfiKRfHsoKT",
                            "name": "mesesExtension"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldCEPgWrndGlQRF0",
                            "name": "coberturaPoliza"
                        },
                        {
                            "type": "percent",
                            "options": {
                                "precision": 2
                            },
                            "id": "fld0KQVdEluuE8dDb",
                            "name": "polizaCoberturaPorcentaje"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldyO0dR5xjII9HMX",
                            "name": "polizaCosteCalculo"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldG3rbkoMDbuxe7B",
                            "name": "fechaInicio"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldwlLcPivspceJZl",
                            "name": "fechaFin"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fld5qwuHLd8V4lGYA",
                            "name": "fecha firma"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldXjiHD6pucRY8qj",
                            "name": "día cobro inq"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldX62V2qRvY0X7ni",
                            "name": "día pago prop"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld4MyXShWVn7pWZF",
                            "name": "apoyoFechaPago"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldPbpIHfK39bGZl2",
                            "name": "gestionCobro"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selcGjBOhMlHUT6Ot",
                                        "name": "Advancing",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selA5RitmxskcjCms",
                                        "name": "Propietario",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "seliJN59tucxlPZrK",
                                        "name": "Agencia",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldDH2gmTeqPrDZms",
                            "name": "gestionCobroSelect"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selTucenrwJVZGs5T",
                                        "name": "Propietario",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selsEot0gUoeT1H7W",
                                        "name": "Agencia",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldtQtkMTeXaqNMVC",
                            "name": "receptorPago"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selYEJhp3tYdqYh1N",
                                        "name": "Por anticipado",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selU9r9AYVfKc3Cor",
                                        "name": "Primer mes",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selJ1uR1hhg9GFp12",
                                        "name": "En 2 meses",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "seltWNp9VrPbYorHO",
                                        "name": "Mensualmente",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldxdjQwDUbL6sAyp",
                            "name": "cobroServicio"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldQd2Iw191LsI6up",
                            "name": "linkPagador"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selwljqOazU8PY52X",
                                        "name": "Propietario",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selHvlSdYkPuDCClr",
                                        "name": "Inquilino",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selz2ivl4452ySYc7",
                                        "name": "Agencia",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selWILJ0d01N6gfPf",
                                        "name": "50% propietario / 50% inquilino",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldDUjy7jrW8rYdDo",
                            "name": "pagadorServicio"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldqGop9T6s0OZVnl",
                            "name": "diasServicio"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldVa3bfj7ej1vb1J",
                            "name": "id_deal"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldjbfiwcIyiDhQf6",
                            "name": "pagadorNombre"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMh3Lozbh20yv0l",
                            "name": "pagadorNombreCompleto"
                        },
                        {
                            "type": "singleLineText",
                            "id": "flda2pglffZTzlTTS",
                            "name": "pagadorIBAN"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldU8QxRJP0kqZVrk",
                            "name": "direccion inmueble"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldDwt4Jb5Szp4D5S",
                            "name": "linkPagadorNumeroDocumento"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldjAksJk2dDWN7Td",
                            "name": "linkPagadorNumeroCuenta"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldeg2ZjqDixv9G1i",
                            "name": "linkPagadorNombreCompleto"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldXkD5aA9ho0WHqi",
                            "name": "linkCobrador"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld5xxivn9SoV3Mqc",
                            "name": "linkCobradorNombreCompleto"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldlbnM7EAfB51K9e",
                            "name": "linkCobradorNumeroDocumento"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldWoxur4wvXNMVl7",
                            "name": "linkCobradorNumeroDeCuenta"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld73WKraSn9Qd9gb",
                            "name": "linkCobradorSwiftBIC"
                        },
                        {
                            "type": "multilineText",
                            "id": "fld5DcZqg5yMwTkzX",
                            "name": "recordID"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://airtable.com/appuV5kGKzKdXlhoR/pagbyyPyyYM2epGOK/\"&{fld5DcZqg5yMwTkzX}&\"?home=pagKdnAcnoxYZUM3h\"",
                                "referencedFieldIds": [
                                    "fld5DcZqg5yMwTkzX"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldB28nEBwqpv3pCw",
                            "name": "verGestor"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "us",
                                    "format": "M/D/YYYY"
                                },
                                "timeFormat": {
                                    "name": "12hour",
                                    "format": "h:mma"
                                },
                                "timeZone": "utc"
                            },
                            "id": "fldoNJ6HzEIYCdqlf",
                            "name": "fechaFirmaSEPA"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldELB2u320ihPDo4",
                            "name": "ComisionProductoConIVA"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl7La9hiBj30Ikp0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldSItAZpGNN7Ts7j"
                            },
                            "id": "fldrIASxOpeyAWF81",
                            "name": "Transactions"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selKgdZsa8WZveETn",
                                        "name": "NUEVO",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selR6g6UwA3OLFA5v",
                                        "name": "RENOVACION",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "selpoe4JtGbHGDQoJ",
                                        "name": "EXTENSION",
                                        "color": "tealLight1"
                                    },
                                    {
                                        "id": "selAJeGPqHi63FzL9",
                                        "name": "FLEXIBLE",
                                        "color": "cyanLight1"
                                    }
                                ]
                            },
                            "id": "fldPCuSq6EJJnVbPg",
                            "name": "tipo contrato"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selA2Ps8QXOGKduXW",
                                        "name": "mes a mes",
                                        "color": "tealLight1"
                                    },
                                    {
                                        "id": "seltbZPoNfOAmFjfT",
                                        "name": "temporal",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "seludtsfutUFzS2pY",
                                        "name": "12 meses",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selTgKFXRQXP0Xypp",
                                        "name": "flexible",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selcpkLlT5smtxEsq",
                                        "name": "no aplica",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selIzU3b9qRnxsvG1",
                                        "name": "local comercial",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selgKDSkeJiOrSe7N",
                                        "name": "producto",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selZZVundCV8vXvBw",
                                        "name": "Tipo de producto",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selwVTLhgjNmgeBfa",
                                        "name": "Mes a mes",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selzyeqLSW9AjB9xa",
                                        "name": "Temporal",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selc33cQYmPHLYiEf",
                                        "name": "Flexible",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selSnwnU6WpkZsq8G",
                                        "name": "Local comercial",
                                        "color": "orangeLight2"
                                    }
                                ]
                            },
                            "id": "fldzmHafdScDXvVy9",
                            "name": "producto"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwMPh1o0urHR71VK",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblYNdOLuMvpBavEu",
                    "name": "balance",
                    "description": "CORE",
                    "primaryFieldId": "fldBZvpWBansJXdhG",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldgkJ6o0sNLkOa84}",
                                "referencedFieldIds": [
                                    "fldgkJ6o0sNLkOa84"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldBZvpWBansJXdhG",
                            "name": "index"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblWnB9SCfCFoXzfW",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldH0VDmRaOLBJwdt"
                            },
                            "id": "fldOnUYgysh29VHMe",
                            "name": "linkDeal"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldELB2u320ihPDo4",
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fld8ufg5a2oQD5zXH",
                            "name": "linkDealComisionProductoConIVA"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldxdjQwDUbL6sAyp",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selYEJhp3tYdqYh1N",
                                                "name": "Por anticipado",
                                                "color": "blueLight2"
                                            },
                                            {
                                                "id": "selU9r9AYVfKc3Cor",
                                                "name": "Primer mes",
                                                "color": "greenLight2"
                                            },
                                            {
                                                "id": "selJ1uR1hhg9GFp12",
                                                "name": "En 2 meses",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "seltWNp9VrPbYorHO",
                                                "name": "Mensualmente",
                                                "color": "cyanLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldXmlZA1eftErNUH",
                            "name": "linkDealCobroServicio"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldDUjy7jrW8rYdDo",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selwljqOazU8PY52X",
                                                "name": "Propietario",
                                                "color": "blueLight2"
                                            },
                                            {
                                                "id": "selHvlSdYkPuDCClr",
                                                "name": "Inquilino",
                                                "color": "cyanLight2"
                                            },
                                            {
                                                "id": "selz2ivl4452ySYc7",
                                                "name": "Agencia",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "selWILJ0d01N6gfPf",
                                                "name": "50% propietario / 50% inquilino",
                                                "color": "greenLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fld8pWvwwTrSXW9UB",
                            "name": "linkDealPagadorServicio"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldZE4Q0citWseonB",
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldJcNjpO6xdBzrsX",
                            "name": "linkDealPrecioCalculo"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldCEPgWrndGlQRF0",
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldg2yMltb758Heww",
                            "name": "linkDealCoberturaPoliza"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldCulx3TI4WbvVUF",
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldKuTVpQ1p866UT9",
                            "name": "linkDealNumeroPoliza"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldbPGPyt4Iy9vSBY",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selRtN6Wbqmn4f0be",
                                                "name": "Con franquicia",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "sel1ys2e8aNzW9U30",
                                                "name": "Sin franquicia",
                                                "color": "tealBright"
                                            },
                                            {
                                                "id": "sel24Ay28Dhl5WI2p",
                                                "name": "Suministros",
                                                "color": "yellowBright"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldKnRVQ4Gh3BLb5A",
                            "name": "linkDealTipoPoliza"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fld74RowcmOZGGwjN",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "seljaaoJiA7n9vNuB",
                                                "name": "pendiente",
                                                "color": "yellowBright"
                                            },
                                            {
                                                "id": "selAZalZCPtOpgRzg",
                                                "name": "firmado",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selpj4ZkEPZbj2LjN",
                                                "name": "cancelada",
                                                "color": "redBright"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldIi5Um2E4e2a4mA",
                            "name": "linkDealEstadoPoliza"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldOWMoUj9PcRYoCk",
                                "result": {
                                    "type": "multipleAttachments",
                                    "options": {
                                        "isReversed": false
                                    }
                                }
                            },
                            "id": "fldjLMoV2Sl9i9M23",
                            "name": "linkPolizaDocumento"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldwlLcPivspceJZl",
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldazyoqkcLBORjuC",
                            "name": "linkPolizaFechaFin"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldJ77NBAlUHSyFmY",
                                "result": {
                                    "type": "multilineText"
                                }
                            },
                            "id": "fldgkJ6o0sNLkOa84",
                            "name": "linkDealIndex"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldX62V2qRvY0X7ni",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldixiiRoT0qebXjS",
                            "name": "diaPagoProp"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldXjiHD6pucRY8qj",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldhqOjGupd3dpW6G",
                            "name": "diaCobroInq"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldOnUYgysh29VHMe",
                                "fieldIdInLinkedTable": "fldG3rbkoMDbuxe7B",
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldCMnqOnCBuMp1RI",
                            "name": "linkDealFechaInicio"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldceXrAwBSiwyn5Q",
                            "name": "meses"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldi0sHpqHsq1hLc2",
                            "name": "diasServicio"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC"
                            },
                            "id": "fldujLADafFDyljqF",
                            "name": "linkMesesCount"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldujLADafFDyljqF}+1",
                                "referencedFieldIds": [
                                    "fldujLADafFDyljqF"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fld9V52oNEVNIAHsY",
                            "name": "linkMesesCountSiguiente"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldtJw4GfIzEtc7h2",
                            "name": "importe"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldorr9YfUzQwqVYu",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldK3DGvXgeNBHceP",
                            "name": "linkMeseslinkCashflowsInRollupImporteNeto"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldXxfMxhHzHGvSy6",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldm9UXYLVvfuMvsN",
                            "name": "linkMeseslinkCashflowsInRollupImporteNetoRealizado"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldMJupQm2MvKlMyK",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldnPgVXzFW0zKf8a",
                            "name": "linkMeseslinkCashflowsOutRollupImporteNeto"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldaDUmaDbbTrGL4T",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldOaIRHkHRZptzyR",
                            "name": "linkMeseslinkCashflowsOutRollupImporteNetoRealizado"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldn0W4K7D0cFELyb",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldg1Tm0RcNjyYcXr",
                            "name": "linkMesesRollupSaldoTotal"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFlp2wDVWljyTtC",
                                "fieldIdInLinkedTable": "fldpYIs1CnH3IKFhm",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fld6gXrFOE4TC512R",
                            "name": "linkMesesRollupSaldoTotalRealizado"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fld3xgc019HCaYJZP"
                            },
                            "id": "fldZw3yDK5LKFqaAx",
                            "name": "linkBankAccount"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selCFcpUJsGO0Kf71",
                                        "name": "Pendiente",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "seltCqiUmPR5zTiNz",
                                        "name": "Ejecutando",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selcrptb3xA7Z04q3",
                                        "name": "Ok",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldpH3ROL7agplPOE",
                            "name": "statusGenerarRentas"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selnEZkPHtAzdAfef",
                                        "name": "Unnax",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selXBaZgjgCyYppqg",
                                        "name": "Caixa",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selheydTVpJfvdA15",
                                        "name": "Manual",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldSVisYm1biJH5jz",
                            "name": "sistemaPago"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel6rttFpuIWWIoiM",
                                        "name": "SEPA",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selGG5tyuYvoW29gv",
                                        "name": "Transferencia",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldy90BjhT4JiQmI2",
                            "name": "defaultTypeCashIn"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selGG5tyuYvoW29gv",
                                        "name": "Transferencia",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldBbo9myD9gmEDz7",
                            "name": "defaultTypeCashOut"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldLckfyVd2mmEECQ"
                            },
                            "id": "fldI4VmjA6mFbco12",
                            "name": "linkBankAccountCashOut"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fld5aGOXNNTD8oEyH"
                            },
                            "id": "fldEwSNtJlZRHKuRk",
                            "name": "linkBankAccountCashIn"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldyCWFzrTMhWs7FT"
                            },
                            "id": "fldVtegaBGTfKnJVO",
                            "name": "linkCashflow"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblRe7RrddAjqTl54",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldYXdk4ehQIlmxs7"
                            },
                            "id": "fldFAVlatFMHjJBl3",
                            "name": "linkCashOut"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVtegaBGTfKnJVO"
                            },
                            "id": "fldyX85aqa2F0rPyG",
                            "name": "linkCashflowInCount"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFAVlatFMHjJBl3"
                            },
                            "id": "fld0b0BOhCiCLMc07",
                            "name": "linkCashOutCount"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldceXrAwBSiwyn5Q}-{fldyX85aqa2F0rPyG}",
                                "referencedFieldIds": [
                                    "fldceXrAwBSiwyn5Q",
                                    "fldyX85aqa2F0rPyG"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldsIBSVq8kVu1by0",
                            "name": "diffMesesCashIn"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldceXrAwBSiwyn5Q}-{fldujLADafFDyljqF}",
                                "referencedFieldIds": [
                                    "fldceXrAwBSiwyn5Q",
                                    "fldujLADafFDyljqF"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldlgOsQq2SAZOhFu",
                            "name": "diffMeses"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldceXrAwBSiwyn5Q}-{fldyX85aqa2F0rPyG}",
                                "referencedFieldIds": [
                                    "fldceXrAwBSiwyn5Q",
                                    "fldyX85aqa2F0rPyG"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldu4OiLJy7CQVllt",
                            "name": "diffMesesCashOut"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT(({fldhqOjGupd3dpW6G}&\"/\"&DATETIME_FORMAT({fldCMnqOnCBuMp1RI},'MM/YYYY')),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldhqOjGupd3dpW6G",
                                    "fldCMnqOnCBuMp1RI"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldmzANWHQ1YcxfCI",
                            "name": "fechaPrimerCobro"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT(({fldixiiRoT0qebXjS}&\"/\"&DATETIME_FORMAT({fldCMnqOnCBuMp1RI},'MM/YYYY')),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldixiiRoT0qebXjS",
                                    "fldCMnqOnCBuMp1RI"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldt8BxJAp6byNMfL",
                            "name": "fechaPrimerPago"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldyX85aqa2F0rPyG}+1",
                                "referencedFieldIds": [
                                    "fldyX85aqa2F0rPyG"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "flddev2W93fL44OGb",
                            "name": "linkCashflowInCountSiguiente"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fld0b0BOhCiCLMc07}+1",
                                "referencedFieldIds": [
                                    "fld0b0BOhCiCLMc07"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "flddtdokIjfwF0dDd",
                            "name": "linkCashOutCountSiguiente"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD({fldmzANWHQ1YcxfCI},{flddev2W93fL44OGb}-1,'month')",
                                "referencedFieldIds": [
                                    "fldmzANWHQ1YcxfCI",
                                    "flddev2W93fL44OGb"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldMX2xDWShudLHun",
                            "name": "calcSiguienteCashIn"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD({fldmzANWHQ1YcxfCI},{fld9V52oNEVNIAHsY}-1,'month')",
                                "referencedFieldIds": [
                                    "fldmzANWHQ1YcxfCI",
                                    "fld9V52oNEVNIAHsY"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldPwImoLVkkRouhE",
                            "name": "calcSiguienteMeses"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD({fldt8BxJAp6byNMfL},{flddtdokIjfwF0dDd}-1,'month')",
                                "referencedFieldIds": [
                                    "fldt8BxJAp6byNMfL",
                                    "flddtdokIjfwF0dDd"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldFuEe17zfVsoIwb",
                            "name": "calcSiguienteCashOut"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": false,
                                "formula": "column_value_fld50BvzkQr0huYVK+column_value_fldcXamUxmJuo52XP",
                                "referencedFieldIds": [],
                                "result": null
                            },
                            "id": "fldOMrIHaL1rVXCMc",
                            "name": "balance"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF(\n  {fld6gXrFOE4TC512R}>=0,\n  \"Al día\",\n  \"Deudas\"\n)",
                                "referencedFieldIds": [
                                    "fld6gXrFOE4TC512R"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "Al día",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selzTN35zbx0bthdL",
                                                "name": "Deudas",
                                                "color": "redBright"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldirucHn1A6UXbl1",
                            "name": "balanceStatus",
                            "description": "**Atención Pagos pendientes"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVtegaBGTfKnJVO"
                            },
                            "id": "fldlsgHPm2rT8y91a",
                            "name": "linkCashflowInCountCobrado"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldm9UXYLVvfuMvsN}/{fldK3DGvXgeNBHceP}",
                                "referencedFieldIds": [
                                    "fldm9UXYLVvfuMvsN",
                                    "fldK3DGvXgeNBHceP"
                                ],
                                "result": {
                                    "type": "percent",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldcnfVbZuYlCc38q",
                            "name": "evolucion"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fld6gXrFOE4TC512R}>0,\n\"No hay deuda\",\n  IF(\n  {fldg2yMltb758Heww}+{fld6gXrFOE4TC512R}<0,\n  \"No, deuda excede póliza\",\n  \"Sí\"))",
                                "referencedFieldIds": [
                                    "fld6gXrFOE4TC512R",
                                    "fldg2yMltb758Heww"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "No, deuda excede póliza",
                                                "color": "redBright"
                                            },
                                            {
                                                "id": "selaYZW4nwHmBOIYp",
                                                "name": "Sí",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selPB6NHbHMaoMPyV",
                                                "name": "No hay deuda",
                                                "color": "greenLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldbcPlM6VjpLwLXR",
                            "name": "diffBalancePoliza",
                            "description": "Compara cobertura de póliza vs. balance"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl2izIaOR37sRHGg",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldfh0vDzeqRuTFFE"
                            },
                            "id": "fldFlp2wDVWljyTtC",
                            "name": "linkMeses"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVtegaBGTfKnJVO",
                                "fieldIdInLinkedTable": "fldotQmPpuqqkEkLI",
                                "result": {
                                    "type": "multipleRecordLinks",
                                    "options": {
                                        "isReversed": false,
                                        "prefersSingleRecordLink": false
                                    }
                                }
                            },
                            "id": "fldtsyHHFOFSt4eYY",
                            "name": "linkDASParteIncidencia (from linkCashIn)"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl8iwwIepmAwmDmK",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldsNq3Y8Q3CtQqPd"
                            },
                            "id": "fld6FgdjeSTJyjXuz",
                            "name": "linkDASPartes"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldOaIRHkHRZptzyR}/{fldnPgVXzFW0zKf8a}",
                                "referencedFieldIds": [
                                    "fldOaIRHkHRZptzyR",
                                    "fldnPgVXzFW0zKf8a"
                                ],
                                "result": {
                                    "type": "percent",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldGQL0NRRvhekb9W",
                            "name": "evolucionCashOuts"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"HABLAR DEL PRORRATEO E IMPUTACIÓN COMISIÓN\"",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldX9vJ70ZbTA2oM0",
                            "name": "notas"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fld6gXrFOE4TC512R}-{fldJcNjpO6xdBzrsX}",
                                "referencedFieldIds": [
                                    "fld6gXrFOE4TC512R",
                                    "fldJcNjpO6xdBzrsX"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldo4Dz3UGBWEIg84",
                            "name": "saldoTotalSinComision"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblAu0eMls9cOSFbZ",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldHxr9C46gc0Pc0V"
                            },
                            "id": "fldwdq6pnPy5LCjXu",
                            "name": "linkMandate"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldwdq6pnPy5LCjXu",
                                "fieldIdInLinkedTable": "fldgwydQt7KfeSH6p",
                                "result": {
                                    "type": "multipleRecordLinks",
                                    "options": {
                                        "isReversed": false,
                                        "prefersSingleRecordLink": false
                                    }
                                }
                            },
                            "id": "fld9akyufdLV7y1rC",
                            "name": "linkMandateLinkBankAccount"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selsRGA0Hvsy7HzG0",
                                        "name": "Unnax",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selL9dPopCkqxb7Pi",
                                        "name": "Caixa",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldeTmNZoASPf81XO",
                            "name": "IBANdestino"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVtegaBGTfKnJVO"
                            },
                            "id": "fldCHqFNDc2iUlYM4",
                            "name": "Cobros con incidencias",
                            "description": "linkCashflowsInRecuentoIncidencias"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel1yVgPJ5Q9v1Ns8",
                                        "name": "Creado",
                                        "color": "purpleLight2"
                                    },
                                    {
                                        "id": "sel16rZAwfZuWCF47",
                                        "name": "Cuentas y config",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selQCWPHRypYpLdzb",
                                        "name": "Creando rentas",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "sel1v81UNX8hZWT82",
                                        "name": "En proceso",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "selv87oiiy0FWgQJb",
                                        "name": "Con incidencias",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "selNfJQ6FWHqetxxx",
                                        "name": "Fin",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldzl5KA8qD5L5ILr",
                            "name": "status"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl3PChHmHfWSzZVs",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldenH3Zj8NrpE0VY"
                            },
                            "id": "fldiZEWwafITebXmH",
                            "name": "mandatosCaixa"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwolRCJ1FitWBsD6",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl2izIaOR37sRHGg",
                    "name": "rentas",
                    "description": "CORE",
                    "primaryFieldId": "fld4skLMVZRYGDOtM",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldTWeJAYDxWOZWPJ}&\" \"&DATETIME_FORMAT({fldSdtfW7UfIw8z4V},'MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldTWeJAYDxWOZWPJ",
                                    "fldSdtfW7UfIw8z4V"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld4skLMVZRYGDOtM",
                            "name": "index"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldSdtfW7UfIw8z4V",
                            "name": "fecha"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldfh0vDzeqRuTFFE",
                                "fieldIdInLinkedTable": "fldixiiRoT0qebXjS",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldoh6AEoz77MGSui",
                            "name": "linkDealBalanceDiaPagoProp"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldfh0vDzeqRuTFFE",
                                "fieldIdInLinkedTable": "fldhqOjGupd3dpW6G",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldZjkhqohz09d1yK",
                            "name": "linkDealBalanceDiaCobroInq"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT(({fldZjkhqohz09d1yK}&\"/\"&DATETIME_FORMAT({fldSdtfW7UfIw8z4V},'MM/YYYY')),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldZjkhqohz09d1yK",
                                    "fldSdtfW7UfIw8z4V"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld6VkIuSv0cQA2ys",
                            "name": "calcFechaCobroInq"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_PARSE({fldZjkhqohz09d1yK}&\"/\"&DATETIME_FORMAT({fldSdtfW7UfIw8z4V},'MM/YYYY'),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldZjkhqohz09d1yK",
                                    "fldSdtfW7UfIw8z4V"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldjDiLxAm6wz3PK7",
                            "name": "calcFechaCobroInqv2"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT(({fldoh6AEoz77MGSui}&\"/\"&DATETIME_FORMAT({fldSdtfW7UfIw8z4V},'MM/YYYY')),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldoh6AEoz77MGSui",
                                    "fldSdtfW7UfIw8z4V"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldstT9HWRAlYfdFY",
                            "name": "calcFechaPagoProp"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_PARSE({fldoh6AEoz77MGSui}&\"/\"&DATETIME_FORMAT({fldSdtfW7UfIw8z4V},'MM/YYYY'),'DD/MM/YYYY')",
                                "referencedFieldIds": [
                                    "fldoh6AEoz77MGSui",
                                    "fldSdtfW7UfIw8z4V"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fldDDylBdMCy7pgt9",
                            "name": "calcFechaPagoPropv2"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldS4Zqn2KLOox9jG",
                            "name": "importeServicio",
                            "description": "Imputación de servicio según modalidad"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fld2DbSB516n1bU8f}+{fldS4Zqn2KLOox9jG}",
                                "referencedFieldIds": [
                                    "fld2DbSB516n1bU8f",
                                    "fldS4Zqn2KLOox9jG"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldLDVAE0poyqVzDn",
                            "name": "importeTotal"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldFlp2wDVWljyTtC"
                            },
                            "id": "fldfh0vDzeqRuTFFE",
                            "name": "dealBalance"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldfh0vDzeqRuTFFE",
                                "fieldIdInLinkedTable": "fldy90BjhT4JiQmI2",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "sel6rttFpuIWWIoiM",
                                                "name": "SEPA",
                                                "color": "blueLight2"
                                            },
                                            {
                                                "id": "selGG5tyuYvoW29gv",
                                                "name": "Transferencia",
                                                "color": "cyanLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldGhkMeq53NSugvP",
                            "name": "linkDealBalancedefaultTypeCashIn"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldfh0vDzeqRuTFFE",
                                "fieldIdInLinkedTable": "fldBbo9myD9gmEDz7",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selGG5tyuYvoW29gv",
                                                "name": "Transferencia",
                                                "color": "cyanLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldc3Qq1dejWlzYyd",
                            "name": "linkDealBalancedefaultTypeCashOut"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldfh0vDzeqRuTFFE",
                                "fieldIdInLinkedTable": "fldSVisYm1biJH5jz",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selnEZkPHtAzdAfef",
                                                "name": "Unnax",
                                                "color": "blueLight2"
                                            },
                                            {
                                                "id": "selXBaZgjgCyYppqg",
                                                "name": "Caixa",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "selheydTVpJfvdA15",
                                                "name": "Manual",
                                                "color": "cyanLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldsNQJ10nnGAiciO",
                            "name": "linkDealBalanceSistemaPago"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldsTJCCfItHDoCgS"
                            },
                            "id": "fld7ERQvv5apIJcyX",
                            "name": "linkCashflows"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldFyfq8PaqbCRgeN",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selO6UrHSQPQT0GNh",
                                                "name": "Pendiente",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "selBzYyT8aIbG622g",
                                                "name": "Cobrado",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selqM2xQa6m6bxh35",
                                                "name": "Cobrada con retraso",
                                                "color": "greenLight1"
                                            },
                                            {
                                                "id": "selnnVBWAOpzQZcvK",
                                                "name": "Devuelta",
                                                "color": "redBright"
                                            },
                                            {
                                                "id": "sel5MNxb7vwK17xHb",
                                                "name": "Pago parcial",
                                                "color": "cyanLight2"
                                            },
                                            {
                                                "id": "selYbeF4WEbAQC71V",
                                                "name": "Recuperada vía DAS",
                                                "color": "orangeLight1"
                                            },
                                            {
                                                "id": "selFvkAydeoqfXGnr",
                                                "name": "Recuperada vía arrendatario",
                                                "color": "greenLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldB9qZLGtnDzC7Mc",
                            "name": "linkCashflowsInStatus"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selPKprnHHTYx7sv8",
                                        "name": "Comisión Advancing",
                                        "color": "yellowBright"
                                    },
                                    {
                                        "id": "sel95B51AIfzi8Y1y",
                                        "name": "Alquiler",
                                        "color": "tealLight1"
                                    }
                                ]
                            },
                            "id": "fldTWeJAYDxWOZWPJ",
                            "name": "tipo"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblRe7RrddAjqTl54",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldlgyVGA5gOe7oSt"
                            },
                            "id": "fldFRi1PgsUItqfos",
                            "name": "linkCashOut /deprecated/"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldIMh0gNEA3TuaiG",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selpf4xd48tCI0ciP",
                                                "name": "Pendiente",
                                                "color": "yellowLight2"
                                            },
                                            {
                                                "id": "selVvJnZzD2YW0biP",
                                                "name": "Pagado",
                                                "color": "greenLight1"
                                            },
                                            {
                                                "id": "sel23yDeR47YOlDXE",
                                                "name": "Devuelto",
                                                "color": "orangeLight1"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldZHzXf0L398KBO0",
                            "name": "linkCashflowsOutStatus"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fld2DbSB516n1bU8f",
                            "name": "importe"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fld5NwGSUP5onAOKd",
                            "name": "orden"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl8iwwIepmAwmDmK",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldAyaTDASeRJLX0a"
                            },
                            "id": "fldsYTl4v6TPDxeat",
                            "name": "linkDASParte"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldsYTl4v6TPDxeat",
                                "fieldIdInLinkedTable": "fldMFJPps6HrO7Eyt",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selGT6I4ojPPAFEWp",
                                                "name": "Abierto",
                                                "color": "orangeLight1"
                                            },
                                            {
                                                "id": "selcuPyFCTqo9AvmI",
                                                "name": "DAS paga parcial de renta",
                                                "color": "yellowLight2"
                                            },
                                            {
                                                "id": "sel2A0DlMjxJevId2",
                                                "name": "DAS paga total de rentas",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "sel3xs863pl5kWCV4",
                                                "name": "Cerrado sin recuperación vía inquilino",
                                                "color": "orangeLight1"
                                            },
                                            {
                                                "id": "selzkydEpDccYYxe4",
                                                "name": "Cerrado tras recuperación de renta vía inquilino",
                                                "color": "greenLight1"
                                            },
                                            {
                                                "id": "selBVafAgs4GgWB7u",
                                                "name": "Cerrado por recuperación de renta vía inquilino (sin DAS)",
                                                "color": "greenBright"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldMmXQThT4PVLFKZ",
                            "name": "linkDASParteStatus"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selfwEhg5gYaYMYf7",
                                        "name": "Unnax",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selKUVjiS9yCOiUyY",
                                        "name": "La Caixa",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selIIs7eB6MGltmWE",
                                        "name": "Caixa",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldKBseprTEyZysG8",
                            "name": "sistemaPago"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selBcehOvMmnLJ0n6",
                                        "name": "SEPA",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "sel1T4buCnfWA2HoM",
                                        "name": "Transferencia",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selOyvq4TAiG861PJ",
                                        "name": "Tarjeta",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldYh87G1bwaf2lxl",
                            "name": "metodoPago"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldX12SuojkDlp2AR",
                            "name": "fechaPago"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldxlDvsvVakclZfI",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldorr9YfUzQwqVYu",
                            "name": "linkCashflowsInRollupImporteNeto"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldxlDvsvVakclZfI",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldXxfMxhHzHGvSy6",
                            "name": "linkCashflowsInRollupImporteNetoRealizado"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldxlDvsvVakclZfI",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldMJupQm2MvKlMyK",
                            "name": "linkCashflowsOutRollupImporteNeto"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld7ERQvv5apIJcyX",
                                "fieldIdInLinkedTable": "fldxlDvsvVakclZfI",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldaDUmaDbbTrGL4T",
                            "name": "linkCashflowsOutRollupImporteNetoRealizado"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldorr9YfUzQwqVYu}+{fldMJupQm2MvKlMyK}",
                                "referencedFieldIds": [
                                    "fldorr9YfUzQwqVYu",
                                    "fldMJupQm2MvKlMyK"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldn0W4K7D0cFELyb",
                            "name": "saldoTotal"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldXxfMxhHzHGvSy6}+{fldaDUmaDbbTrGL4T}",
                                "referencedFieldIds": [
                                    "fldXxfMxhHzHGvSy6",
                                    "fldaDUmaDbbTrGL4T"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldpYIs1CnH3IKFhm",
                            "name": "saldoTotalRealizado"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwmCn4djjGXnAn73",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblxY6upsLDmqzaaL",
                    "name": "cashflow",
                    "description": "CORE",
                    "primaryFieldId": "fldK1xDaRJ5VrX0F9",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldc5yW3lEIo5OoE8}\n&\" - \"\n&SWITCH(MONTH({fldrquziQqJoTn08B}),\n1,\"Enero\",\n2,\"Febrero\",\n3,\"Marzo\",\n4,\"Abril\",\n5,\"Mayo\",\n6,\"Junio\",\n7,\"Julio\",\n8,\"Agosto\",\n9,\"Septiembre\",\n10,\"Octubre\",\n11,\"Noviembre\",\n12,\"Diciembre\")\n&\" \"\n&YEAR({fldrquziQqJoTn08B})\n&\" - \"\n&{fldFyfq8PaqbCRgeN}",
                                "referencedFieldIds": [
                                    "fldc5yW3lEIo5OoE8",
                                    "fldrquziQqJoTn08B",
                                    "fldFyfq8PaqbCRgeN"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldK1xDaRJ5VrX0F9",
                            "name": "index"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "seldBJGV8k7I2bo4D",
                                        "name": "In",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selDCyORmXGVtvzkA",
                                        "name": "Out",
                                        "color": "redLight2"
                                    }
                                ]
                            },
                            "id": "fld656RBx2XkCHzR7",
                            "name": "direccion"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selO6UrHSQPQT0GNh",
                                        "name": "Pendiente",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selBzYyT8aIbG622g",
                                        "name": "Cobrado",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "selqM2xQa6m6bxh35",
                                        "name": "Cobrada con retraso",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "selnnVBWAOpzQZcvK",
                                        "name": "Devuelta",
                                        "color": "redBright"
                                    },
                                    {
                                        "id": "sel5MNxb7vwK17xHb",
                                        "name": "Pago parcial",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selYbeF4WEbAQC71V",
                                        "name": "Recuperada vía DAS",
                                        "color": "orangeLight1"
                                    },
                                    {
                                        "id": "selFvkAydeoqfXGnr",
                                        "name": "Recuperada vía arrendatario",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldFyfq8PaqbCRgeN",
                            "name": "statusIns"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldVtegaBGTfKnJVO"
                            },
                            "id": "fldyCWFzrTMhWs7FT",
                            "name": "linkDealBalance"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldrquziQqJoTn08B",
                            "name": "fechaProgramada"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl2izIaOR37sRHGg",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fld7ERQvv5apIJcyX"
                            },
                            "id": "fldsTJCCfItHDoCgS",
                            "name": "linkRenta"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selxWHOlkAZMsWk61",
                                        "name": "Unnax",
                                        "color": "purpleBright"
                                    },
                                    {
                                        "id": "sel5FcZPwQpmcGqNC",
                                        "name": "Caixa",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selR7TVdEqAWTBmVD",
                                        "name": "DAS",
                                        "color": "redLight1"
                                    }
                                ]
                            },
                            "id": "fldjNItVaCzrhlNhf",
                            "name": "sistemaPago"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selpf4xd48tCI0ciP",
                                        "name": "Pendiente",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selVvJnZzD2YW0biP",
                                        "name": "Pagado",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "sel23yDeR47YOlDXE",
                                        "name": "Devuelto",
                                        "color": "orangeLight1"
                                    }
                                ]
                            },
                            "id": "fldIMh0gNEA3TuaiG",
                            "name": "statusOut"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldX8dI3S6k1SNgCA"
                            },
                            "id": "fldIL0Ox4naAhYeYM",
                            "name": "linkTransactions",
                            "description": "SYSTEM: Unnax\nCada transaction en Unnax"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT({fldrquziQqJoTn08B},'YYYY-MM-DD')",
                                "referencedFieldIds": [
                                    "fldrquziQqJoTn08B"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldC4U7WqTMAldhr1",
                            "name": "fechaProgramadaISO"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl4wzfXvZICfxqc0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldHjP7a35Fcsp3zb"
                            },
                            "id": "fldTbaecb3VfmQR3d",
                            "name": "linkRemesa"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT({fldrquziQqJoTn08B},'YYYY-MM')",
                                "referencedFieldIds": [
                                    "fldrquziQqJoTn08B"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld4GhxCuG7DXIStM",
                            "name": "formatRemesa"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl7La9hiBj30Ikp0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldNyHa686Ed6apqu"
                            },
                            "id": "fldz6bEbVOE6rc6zQ",
                            "name": "linkTransactionsCaixa"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldbkCQZwDR8a9kRP",
                            "name": "importe"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldc5yW3lEIo5OoE8",
                            "name": "orden"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl8iwwIepmAwmDmK",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldpYFcbI1O6L5kkd"
                            },
                            "id": "fldotQmPpuqqkEkLI",
                            "name": "linkDASParteIncidencia"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl8iwwIepmAwmDmK",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldckKN76GQHPrqbk"
                            },
                            "id": "fld0VnYeDD63RRAta",
                            "name": "linkDASParteCompensacion"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selNqm7memsxNmFCl",
                                        "name": "Pagador alquiler",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "sel0jyKhHzcva6PHi",
                                        "name": "DAS",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selDDrTJcX0YE3ajI",
                                        "name": "Propietario",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldazRk0SXXdqQo9L",
                            "name": "sujeto"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fld5eJ1zqTiT5DD1n",
                            "name": "fechaPago",
                            "description": "Fecha de realización"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selQ7zSDo7AvUyKjH",
                                        "name": "SEPA",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selbiblYrZyPAQVZ9",
                                        "name": "Transferencia",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "seleYYHIcPvyb7Kpz",
                                        "name": "Tarjeta",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldn69DhRftezHhcZ",
                            "name": "metodoPago"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH(\n  {fld656RBx2XkCHzR7},\n  \"In\",1*{fldbkCQZwDR8a9kRP},\n  \"Out\",(-1)*{fldbkCQZwDR8a9kRP})",
                                "referencedFieldIds": [
                                    "fld656RBx2XkCHzR7",
                                    "fldbkCQZwDR8a9kRP"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldxlDvsvVakclZfI",
                            "name": "importeNeto"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH({fld656RBx2XkCHzR7},\n\"In\",{fldFyfq8PaqbCRgeN},\n\"Out\",{fldIMh0gNEA3TuaiG})",
                                "referencedFieldIds": [
                                    "fld656RBx2XkCHzR7",
                                    "fldFyfq8PaqbCRgeN",
                                    "fldIMh0gNEA3TuaiG"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld24y7VdTMjGzhtQ",
                            "name": "statusAplicable"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [
                                    "fldFyfq8PaqbCRgeN",
                                    "fldIMh0gNEA3TuaiG"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldvYV59UxrSyKkwL",
                            "name": "ultimaModificacionStatus"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selRf3mGZO2d0CEvm",
                                        "name": "Renta",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selsJ2L0R8tfMMpbK",
                                        "name": "Recobro",
                                        "color": "orangeLight2"
                                    },
                                    {
                                        "id": "selGKma8fdod7SOkt",
                                        "name": "DAS",
                                        "color": "redLight2"
                                    }
                                ]
                            },
                            "id": "fld17mZxxLYPQfUzr",
                            "name": "razon"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl7La9hiBj30Ikp0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldfWnsujIsEMjxDN"
                            },
                            "id": "fldVLoOdobs1Y1ByC",
                            "name": "Transactions"
                        }
                    ],
                    "views": [
                        {
                            "id": "viw0pOkiyQ6cnGmUb",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl8iwwIepmAwmDmK",
                    "name": "partes",
                    "description": "SYSTEM: DAS",
                    "primaryFieldId": "fldCw8Lf0X6i10hHg",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fld4PVjHzmfBgCRsn},{fld4PVjHzmfBgCRsn},\"Necesaria referencia de DAS\")",
                                "referencedFieldIds": [
                                    "fld4PVjHzmfBgCRsn"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldCw8Lf0X6i10hHg",
                            "name": "index"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldUaVepnSV1jWZAy",
                            "name": "Notes"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldH0XJ3p21Zy88V2",
                            "name": "importe"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selGT6I4ojPPAFEWp",
                                        "name": "Abierto",
                                        "color": "orangeLight1"
                                    },
                                    {
                                        "id": "selcuPyFCTqo9AvmI",
                                        "name": "DAS paga parcial de renta",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "sel2A0DlMjxJevId2",
                                        "name": "DAS paga total de rentas",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "sel3xs863pl5kWCV4",
                                        "name": "Cerrado sin recuperación vía inquilino",
                                        "color": "orangeLight1"
                                    },
                                    {
                                        "id": "selzkydEpDccYYxe4",
                                        "name": "Cerrado tras recuperación de renta vía inquilino",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "selBVafAgs4GgWB7u",
                                        "name": "Cerrado por recuperación de renta vía inquilino (sin DAS)",
                                        "color": "greenBright"
                                    }
                                ]
                            },
                            "id": "fldMFJPps6HrO7Eyt",
                            "name": "status"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl2izIaOR37sRHGg",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldsYTl4v6TPDxeat"
                            },
                            "id": "fldAyaTDASeRJLX0a",
                            "name": "linkMeses"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld4PVjHzmfBgCRsn",
                            "name": "referenciaDAS"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldotQmPpuqqkEkLI"
                            },
                            "id": "fldpYFcbI1O6L5kkd",
                            "name": "linkCashInIncidencia"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fld0VnYeDD63RRAta"
                            },
                            "id": "fldckKN76GQHPrqbk",
                            "name": "linkCashInCompensacion"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblRe7RrddAjqTl54",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldc74zAc6qX4z6jV"
                            },
                            "id": "flddHa4FAFOE1U3Ab",
                            "name": "linkCashoutDevolucion"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldqAL8aPx1fn5bFT",
                            "name": "fechaCreacion"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fld6FgdjeSTJyjXuz"
                            },
                            "id": "fldsNq3Y8Q3CtQqPd",
                            "name": "dealBalance"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwPbgQdPawPsZRTM",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblN8MtBDlLSQyu9o",
                    "name": "bankAccounts",
                    "description": "SYSTEM: UNNAX",
                    "primaryFieldId": "fld72eoCRZ4LuSf9d",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldpT0lijU9t7WHtU}&\" [\"&{fldxArd414nF6BtbR}&\"]\"",
                                "referencedFieldIds": [
                                    "fldpT0lijU9t7WHtU",
                                    "fldxArd414nF6BtbR"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld72eoCRZ4LuSf9d",
                            "name": "index"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldorTqbNpRwI99lb",
                            "name": "accountID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld627dcxvnCW7TuW",
                            "name": "recipientBankCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldcym0YEJPXKcktx",
                            "name": "holderAccountID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldpT0lijU9t7WHtU",
                            "name": "holderName"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldZIOcKPHdM9et2t",
                            "name": "applicantIBANAccount",
                            "description": "Nuestra cuenta Unnax"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldxArd414nF6BtbR",
                            "name": "recipientIBANAccount",
                            "description": "Cliente"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldqFHMc49BD59198",
                            "name": "recipientDirectBIC"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMJc2U6ASSLtSGl",
                            "name": "recipientBIC"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldIVg8vZdvExBpfi",
                            "name": "message"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selxCrNeS5GsW3RmI",
                                        "name": "Pagador",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selD9gUbs5LRIJW0w",
                                        "name": "Perceptor",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldo56EdsafbyzWA6",
                            "name": "tipo"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/sr58d3awr8jnjwyypi1veljxg807uc37?recordID=\"&RECORD_ID()&\"&env=\"&{fldbTCX4HNng0NiDu}",
                                "referencedFieldIds": [
                                    "fldbTCX4HNng0NiDu"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldhbN7O7CnRG3BjM",
                            "name": "webhookVerify"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldNoy92ZrBXWMGiQ",
                            "name": "responseStatusCode"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH({fldNoy92ZrBXWMGiQ},\n\"UNX202\",\"Petición enviada\",\n\"UNX200\",\"Verificado\",\n\"UNX400\",\"Error en datos\",\n\"UNX60\",\"NIF does not match owner\",\n\"UNX61\",\"Datos difieren\",\n\"error\",\"Error en creación\",\n\"Pendiente\")",
                                "referencedFieldIds": [
                                    "fldNoy92ZrBXWMGiQ"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "Pendiente",
                                                "color": "grayLight2"
                                            },
                                            {
                                                "id": "seld9wj2yMPimRC68",
                                                "name": "Petición enviada",
                                                "color": "yellowLight1"
                                            },
                                            {
                                                "id": "selIV2I5SyihOeKAd",
                                                "name": "Verificado",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selEVc0sdAbRj8sQV",
                                                "name": "Error en creación",
                                                "color": "redBright"
                                            },
                                            {
                                                "id": "sel6xywpoH11tHF1f",
                                                "name": "Error en datos",
                                                "color": "redLight1"
                                            },
                                            {
                                                "id": "selJhCw3UQfS9zdAy",
                                                "name": "NIF does not match owner",
                                                "color": "orangeLight1"
                                            },
                                            {
                                                "id": "sel7vmgmxc3oewI06",
                                                "name": "Datos difieren",
                                                "color": "redLight1"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldDv5udn6mrtCVIn",
                            "name": "responseStatusCodeSwitch"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "Europe/Madrid"
                            },
                            "id": "fldaJllJz3ci8RgRE",
                            "name": "updatedAt"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "local",
                                            "format": "l"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "flde72onjpgrFE1iJ",
                            "name": "lastModified"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldOfUSuXQQbkHUb2",
                            "name": "xRequestCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld16uDRzVnevY03w",
                            "name": "errorCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "flddEKpnkalxYVYRe",
                            "name": "errorMessage"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "MID(TRIM({fldxArd414nF6BtbR}),5,4)",
                                "referencedFieldIds": [
                                    "fldxArd414nF6BtbR"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldEx01qDBYfgWwXq",
                            "name": "bankCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldNLHKQGK8jNC4vJ",
                            "name": "signature"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldOPUxLXyyq1jrqu",
                            "name": "responseID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldD1oL4aafnXjcIp",
                            "name": "bankCodeManual"
                        },
                        {
                            "type": "checkbox",
                            "options": {
                                "icon": "check",
                                "color": "greenBright"
                            },
                            "id": "flde8BcTBR3G87wTV",
                            "name": "checkManual"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH({fldrQCW1mEowU8fTm},\n\"DNI\",1,\n\"CIF\",2,\n\"NIE\",2,\n\"Otros\",3,\n1)",
                                "referencedFieldIds": [
                                    "fldrQCW1mEowU8fTm"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldMOWcKvB1n6o1VZ",
                            "name": "accountIDformula"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selmFtq9wSrV7B07x",
                                        "name": "DNI",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selowVyCL1TbSab7j",
                                        "name": "CIF",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selF4abOW2BwOCJ7P",
                                        "name": "NIE",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selQx18vyQlIPYyFs",
                                        "name": "Otros",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldrQCW1mEowU8fTm",
                            "name": "accountIDType"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldZw3yDK5LKFqaAx"
                            },
                            "id": "fld3xgc019HCaYJZP",
                            "name": "linkDealBalance"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fld79j9R2TNb3UpDM"
                            },
                            "id": "fldaRpoJ1rg7AmCbm",
                            "name": "transactions"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblAu0eMls9cOSFbZ",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldgwydQt7KfeSH6p"
                            },
                            "id": "flddqpGg0SW4zBfGy",
                            "name": "linkMandate"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldI4VmjA6mFbco12"
                            },
                            "id": "fldLckfyVd2mmEECQ",
                            "name": "linkDealBalanceCashOuts"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldEwSNtJlZRHKuRk"
                            },
                            "id": "fld5aGOXNNTD8oEyH",
                            "name": "linkDealBalanceCashIns"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selZ2XBDqcTBphR9n",
                                        "name": "ON",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selDBkUrHOHqkfrzf",
                                        "name": "PROD",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldbTCX4HNng0NiDu",
                            "name": "env"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl3PChHmHfWSzZVs",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldvjcpXPUXS28WWe"
                            },
                            "id": "fldEQMnRI4QOU2fcC",
                            "name": "mandatosCaixa"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwp85tW3q67HNcDk",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblAu0eMls9cOSFbZ",
                    "name": "mandate",
                    "description": "SYSTEM: UNNAX",
                    "primaryFieldId": "fldfYbBAjwRbSSd30",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldbNjjJ91nxMFR50}&\" - \"&{fldUhTlwshSpomCEW}&\" - \"&{flduzQibNnoe74Lww}",
                                "referencedFieldIds": [
                                    "fldbNjjJ91nxMFR50",
                                    "fldUhTlwshSpomCEW",
                                    "flduzQibNnoe74Lww"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldfYbBAjwRbSSd30",
                            "name": "index"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld4iNICHOIk0Teva",
                            "name": "mandateType"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldAcqCJAgRJH7ubH",
                            "name": "creditorIdentifier"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldFodXPQE0vFrCNw}",
                                "referencedFieldIds": [
                                    "fldFodXPQE0vFrCNw"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldbNjjJ91nxMFR50",
                            "name": "debtorFullName"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldcuL8VFVhD4iCdP}",
                                "referencedFieldIds": [
                                    "fldcuL8VFVhD4iCdP"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld1wGOryQhzPM5Rx",
                            "name": "debtorAccount"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldQs7ypTXBlGYRyD",
                            "name": "scheme"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldk4g3Fp5ehn8RiZ",
                            "name": "reference"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                }
                            },
                            "id": "fldyHcW7hqhJie3Dv",
                            "name": "signedAt"
                        },
                        {
                            "type": "checkbox",
                            "options": {
                                "icon": "check",
                                "color": "greenBright"
                            },
                            "id": "fldAG624aALA2tcLf",
                            "name": "recurring"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldYfjVorvSRv9Ts0",
                            "name": "xRequestCode"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fld0UFyxP1lfhWnBx",
                            "name": "createdAt"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fld8GAbp7AGNisruR",
                            "name": "updatedAt"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldHqN8fnHdb0mLIC",
                            "name": "expiresAt"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldUhTlwshSpomCEW",
                            "name": "status"
                        },
                        {
                            "type": "singleLineText",
                            "id": "flduzQibNnoe74Lww",
                            "name": "mandateID"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldviHE0cjNac3280"
                            },
                            "id": "fldFtC5iLQcbrL6OJ",
                            "name": "linkTransactions"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/uonrrlty5l57ng4b2cjcwtogby5ct95r?recordID=\"&RECORD_ID()&\"&env=\"&{fldEFiPXtxAIagPPn}",
                                "referencedFieldIds": [
                                    "fldEFiPXtxAIagPPn"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldd1nEGz9tcqFkBL",
                            "name": "webhookCreateMandate"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldFtC5iLQcbrL6OJ"
                            },
                            "id": "fldadufBpt9G3Ad23",
                            "name": "linkTransactionsCount"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF(\n  {flduzQibNnoe74Lww},\n  {fldUhTlwshSpomCEW},\n  \"Sin crear\"\n)",
                                "referencedFieldIds": [
                                    "flduzQibNnoe74Lww",
                                    "fldUhTlwshSpomCEW"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "Sin crear",
                                                "color": "grayLight2"
                                            },
                                            {
                                                "id": "selq5l488jN64hirY",
                                                "name": "ACTIVE",
                                                "color": "blueLight2"
                                            },
                                            {
                                                "id": "seliawCz1F1PoLvpg",
                                                "name": "DELETED",
                                                "color": "cyanLight2"
                                            },
                                            {
                                                "id": "selZ5TMUV3lJtYZQn",
                                                "name": "COMPLETED",
                                                "color": "tealLight2"
                                            },
                                            {
                                                "id": "selqZVhErXlkS5nf8",
                                                "name": "PENDING",
                                                "color": "greenLight2"
                                            },
                                            {
                                                "id": "selZAqkarJkQwGGNX",
                                                "name": "REJECTED",
                                                "color": "yellowLight2"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldAp4YWe4Jw3X2K6",
                            "name": "statusFormula"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldHkFPs4QjPEbBZP",
                            "name": "errorUnnax"
                        },
                        {
                            "type": "createdTime",
                            "options": {
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldTTAZ8EGmayu5PC",
                            "name": "fechaCreacion"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldwdq6pnPy5LCjXu"
                            },
                            "id": "fldHxr9C46gc0Pc0V",
                            "name": "dealBalance"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "flddqpGg0SW4zBfGy"
                            },
                            "id": "fldgwydQt7KfeSH6p",
                            "name": "linkBankAccount"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldgwydQt7KfeSH6p",
                                "fieldIdInLinkedTable": "fldpT0lijU9t7WHtU",
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldFodXPQE0vFrCNw",
                            "name": "linkBankAccountHolderName"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldgwydQt7KfeSH6p",
                                "fieldIdInLinkedTable": "fldZIOcKPHdM9et2t",
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldcuL8VFVhD4iCdP",
                            "name": "linkBankAccountApplicantIBANAccount"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selqNQnOPAoa2pkpR",
                                        "name": "ON",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selIyk8zuVPq15f3F",
                                        "name": "PROD",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldEFiPXtxAIagPPn",
                            "name": "env"
                        }
                    ],
                    "views": [
                        {
                            "id": "viweS6nXVs2fkkYhO",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblAa0z7kJ2PHgvAN",
                    "name": "logs",
                    "primaryFieldId": "fldH8LsYXaN7sdgzF",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldH8LsYXaN7sdgzF",
                            "name": "Name"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldttI8X7C6JFDkd2",
                            "name": "scenarioName"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldu2uFQ8CB1oCP2Y",
                            "name": "scenarioID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld6veRoUJwGfmsHy",
                            "name": "logID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld4WqNOv13d5SQyl",
                            "name": "incompleteExecution"
                        },
                        {
                            "type": "url",
                            "id": "fldPLBqSPaD7jKZiT",
                            "name": "executionURL"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldesAwf1MD5V9ej0",
                            "name": "mainDocumentID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldAmgwfn7w8gPKp3",
                            "name": "mainDocumentType"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwaSzJ8JNimcrpIs",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblRe7RrddAjqTl54",
                    "name": "cashout /deprecated/",
                    "primaryFieldId": "fld0aJCpBWAxaH78H",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fld0aJCpBWAxaH78H",
                            "name": "Name"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldFAVlatFMHjJBl3"
                            },
                            "id": "fldYXdk4ehQIlmxs7",
                            "name": "linkBalance"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel3D91vRi4AoYjs5",
                                        "name": "Devuelto",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selgbcGKbPdmun3Ri",
                                        "name": "Pendiente",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selZ5eEYyw9F3Gba7",
                                        "name": "Pagado",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fld1xtUQI7hMxbJa9",
                            "name": "Status"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldUGf8lhmcHtO0UZ",
                            "name": "importe"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fld7ab8dvwTloDAQP",
                            "name": "fechaProgramada"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fld9a2nDLsLsQfSQU",
                            "name": "orden"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl2izIaOR37sRHGg",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldFRi1PgsUItqfos"
                            },
                            "id": "fldlgyVGA5gOe7oSt",
                            "name": "meses"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl8iwwIepmAwmDmK",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "flddHa4FAFOE1U3Ab"
                            },
                            "id": "fldc74zAc6qX4z6jV",
                            "name": "linkDASParteDevolucion"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selbXzCZiuWgsr1Dz",
                                        "name": "Cobrador alquiler",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "sel8HnZZgI04Apacv",
                                        "name": "DAS",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldJ7WoUuHqcJEANv",
                            "name": "sujetoCobrador"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwXLcGNwscsCKlX0",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblhE3J0X3Zg2CB1o",
                    "name": "transactionsUnnax",
                    "description": "DDPayin docs-> https://developer.unnax.com/docs/docs-ede/7acc063e83120-create-a-direct-debit-pay-in#request-body\n\nPayout -> https://developer.unnax.com/docs/docs-ede/43c635fadfb05-create-a-pay-out \n\nPayin",
                    "primaryFieldId": "fldcKdljpyI50Gkbw",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fldES81dDTHaeFrnb},{fldES81dDTHaeFrnb},\"Pendiente de creación en Unnax\")",
                                "referencedFieldIds": [
                                    "fldES81dDTHaeFrnb"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldcKdljpyI50Gkbw",
                            "name": "index"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF(\n  {fldgO7UzgqcWuws26},\n  {fldgO7UzgqcWuws26}*100,\n  {fldet9kCzA04TGRuk}\n)",
                                "referencedFieldIds": [
                                    "fldgO7UzgqcWuws26",
                                    "fldet9kCzA04TGRuk"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldCVhKiHs0h8ROUV",
                            "name": "moneyAmount",
                            "description": "PAYIN/OUT\nAmount in cents\n\nNúmero entero en céntimos"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selIleqo8XB2XFqVc",
                                        "name": "DIRECT_DEBIT_PAY_IN",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selXGqiaMRzOOQc5s",
                                        "name": "PAY_OUT",
                                        "color": "grayLight1"
                                    },
                                    {
                                        "id": "sel5hNzShh1Eo2ZAq",
                                        "name": "PAY_IN",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selucxtkgdOLmuhVl",
                                        "name": "PAY_OUT_REFUND",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "selxyYsqHeqZP4Hrr",
                                        "name": "DIRECT_DEBIT_PAY_IN_REFUND",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "selN0vl91OzFLxlxt",
                                        "name": "DIRECT_DEBIT_PAY_OUT",
                                        "color": "grayLight1"
                                    },
                                    {
                                        "id": "selmz1xY2HjUxo5n1",
                                        "name": "DIRECT_DEBIT_PAY_OUT_REFUND",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "sel1R5JZPspEd6r0h",
                                        "name": "DIRECT_DEBIT_PAY_OUT_B2B",
                                        "color": "grayLight1"
                                    },
                                    {
                                        "id": "seld2dT6nObQLGyXL",
                                        "name": "DIRECT_DEBIT_PAY_OUT_B2C_REFUND",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "selVEJxm9n6EOJ6g8",
                                        "name": "FEE",
                                        "color": "grayLight1"
                                    },
                                    {
                                        "id": "selBG8mDWupCLewRB",
                                        "name": "FEE_REFUND",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "selBqX0ogndAJeoJV",
                                        "name": "PASSIVE_PAY_IN",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldywz73aWOzLAAdp",
                            "name": "transactionType",
                            "description": "PAYIN: allowed value DIRECT_DEBIT_PAY_IN\n\nPAYOUT: allowed values PAY_OUT\nPAY_OUT_REFUND"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblAu0eMls9cOSFbZ",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldFtC5iLQcbrL6OJ"
                            },
                            "id": "fldviHE0cjNac3280",
                            "name": "linkMandate",
                            "description": "PAYIN: mandate vinculado"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldIL0Ox4naAhYeYM"
                            },
                            "id": "fldX8dI3S6k1SNgCA",
                            "name": "linkCashflows"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldbWhKd6fFCQJcMK}*100",
                                "referencedFieldIds": [
                                    "fldbWhKd6fFCQJcMK"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldet9kCzA04TGRuk",
                            "name": "importeCashflowCentimos"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldgO7UzgqcWuws26",
                            "name": "importeManual"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldaRpoJ1rg7AmCbm"
                            },
                            "id": "fld79j9R2TNb3UpDM",
                            "name": "linkBankAccount"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld79j9R2TNb3UpDM",
                                "fieldIdInLinkedTable": "fldpT0lijU9t7WHtU",
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldzMmdiUfycPybKN",
                            "name": "linkBankAccountHolderName",
                            "description": "Nombre del titular de la cuenta"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fld79j9R2TNb3UpDM",
                                "fieldIdInLinkedTable": "fldxArd414nF6BtbR",
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldkdQY8t2Vbh8qfs",
                            "name": "linkBankAccountRecipientIBANAccount",
                            "description": "IBAN de bank account"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldQ9B38tilzLAOGD",
                            "name": "concept",
                            "description": "PAYIN/OUT \nConcept of the transfer"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld60HQkdUWo72Fz0",
                            "name": "moneyCurrency",
                            "description": "PAYIN/OUT Currency in ISO_4217"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldlxiGsNX0ZF5L3t",
                            "name": "sourceType",
                            "description": "Source Type of the transaction\n\nAllowed value for PAYIN: BANK"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldXfTLIcBhoRRrUg",
                            "name": "sourceAccount",
                            "description": "PAYIN: Bank Account (i.e. IBAN)"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldT52nBPHGrfVpYc",
                            "name": "sourceFullName",
                            "description": "PAYIN: Name + Last Name(s)\n\n"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldqmn1D4w4R02IA7",
                            "name": "recipientWalletID",
                            "description": "PAYIN: wallet ID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldwIxXjJnjGO6JF7",
                            "name": "recipientType",
                            "description": "PAYIN: allowed value-> WALLET"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldARlKlbUSAuQYJp",
                            "name": "recipientVIBAN"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldEqEGiL9DjpqI7Z",
                            "name": "feeCurrency"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldqPjpb6lZQJgE7V",
                            "name": "feeAmount"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldLkoDzOm1GFjp8x",
                            "name": "feeTransactionID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldg1epDefTQ2rR4U",
                            "name": "feeTransactionType"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fld0yTk0PcmGM6tpI",
                            "name": "createdAt",
                            "description": "PAYIN/OUT: Datetime at which this object was created\n\n"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldv5EHamhTxsyzQS",
                            "name": "updatedAt",
                            "description": "PAYIN/OUT: Datetime at which this object was updated for the last time"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldES81dDTHaeFrnb",
                            "name": "transactionID",
                            "description": "PAYIN/OUT: transaction identifier"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldHCGgajogpEzQA7",
                            "name": "reference",
                            "description": "PAYIN: Reference identifier of a transaction. Associated transaction types (Refunds, Rejects) will have the same reference number.\n\n"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selhVnboIuufYBU26",
                                        "name": "Sin crear",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selTz7d7lGEEkJI3x",
                                        "name": "Error en llamada a Wannme",
                                        "color": "pinkLight2"
                                    },
                                    {
                                        "id": "selbOwxxaTnR0Ke9V",
                                        "name": "WIDGET CREATED",
                                        "color": "blueLight1"
                                    },
                                    {
                                        "id": "selgiSdpeK0rHxXrh",
                                        "name": "NEW",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selgvwCfD9VNHrKGv",
                                        "name": "REQUESTED",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selhSvdxgnq3MYmnz",
                                        "name": "AUTHORIZED",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "sel68Gu7rioPX2JNV",
                                        "name": "ERROR",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selTV2Am5Qe1ba3U7",
                                        "name": "COMPLETED",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selaJKnlVdHqRh7Vg",
                                        "name": "EXPIRED",
                                        "color": "orangeLight2"
                                    },
                                    {
                                        "id": "selFNZ3yMXu4zj0WM",
                                        "name": "REJECTED",
                                        "color": "redLight2"
                                    },
                                    {
                                        "id": "seljPeQvTw103Lk8a",
                                        "name": "REFUNDED",
                                        "color": "purpleLight2"
                                    },
                                    {
                                        "id": "sellEp4s5Q2d4ugRM",
                                        "name": "event_payin_login",
                                        "color": "cyanLight1"
                                    },
                                    {
                                        "id": "seldON03GK8H2hlPs",
                                        "name": "event_payin_account_selected",
                                        "color": "tealLight1"
                                    },
                                    {
                                        "id": "selObxYZ4pbFYKPxV",
                                        "name": "event_payment_transfer_lockstep_authorized",
                                        "color": "greenLight1"
                                    },
                                    {
                                        "id": "selspj7aMqKq0NEh4",
                                        "name": "event_payment_transfer_lockstep_completed",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selK8QO7JtZzyvW9S",
                                        "name": "event_payment_transfer_ownership_validation",
                                        "color": "orangeLight1"
                                    },
                                    {
                                        "id": "selL3fS7F1MJ98WjM",
                                        "name": "event_payment_creditcard_pay",
                                        "color": "redLight1"
                                    },
                                    {
                                        "id": "sel3Zfn6IpEheZz0r",
                                        "name": "event_payment_creditcard_preauthorize",
                                        "color": "pinkLight1"
                                    },
                                    {
                                        "id": "seluIzBBH9VlEdcdt",
                                        "name": "event_payment_creditcard_settlement",
                                        "color": "purpleLight1"
                                    }
                                ]
                            },
                            "id": "fldhSwQkyqtSNbGwC",
                            "name": "status",
                            "description": "PAYIN: creation with NEW\n\nPAYOUT: NEW\nREQUESTED\nAUTHORIZED\nERROR\nCANCELLED\nCOMPLETED\nEXPIRED\nREFUNDED\nREJECTED"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldbkl4Ypvp8t5OzC",
                            "name": "statusReason",
                            "description": "SepaReasonCode"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH({fldbkl4Ypvp8t5OzC},\n    \"AC01\", \"Transacción no reconocida\",\n    \"AC04\", \"Cuenta no válida\",\n    \"AC06\", \"Fondos insuficientes\",\n    \"AG01\", \"Aceptación de la instrucción de pago\",\n    \"AG02\", \"Aceptación con condiciones\",\n    \"AM04\", \"Rechazo por solicitud de corrección\",\n    \"AM05\", \"Rechazo por error técnico\",\n    \"BE01\", \"Error en el formato del mensaje\",\n    \"BE05\", \"Información no válida\",\n    \"CNOR\", \"Transacción no reconocida por el banco receptor\",\n    \"DNOR\", \"No se puede procesar la transacción\",\n    \"FF01\", \"Error en la transacción\",\n    \"MD01\", \"Problemas de cumplimiento normativo\",\n    \"MD02\", \"Instrucción de pago no aceptada\",\n    \"MD06\", \"Orden de pago rechazada por el banco\",\n    \"MD07\", \"Instrucción no procesable\",\n    \"MS02\", \"Problemas de autenticación\",\n    \"MS03\", \"Instrucción con datos incorrectos\",\n    \"RC01\", \"Rechazo por falta de fondos\",\n    \"RR01\", \"Rechazo por cuenta cerrada\",\n    \"RR02\", \"Rechazo por cuenta bloqueada\",\n    \"RR03\", \"Rechazo por información insuficiente\",\n    \"RR04\", \"Rechazo por transacción no permitida\",\n    \"SL01\", \"Instrucción de pago exitosa\",\n    \"TECH\", \"Error técnico en el procesamiento\"\n)\n",
                                "referencedFieldIds": [
                                    "fldbkl4Ypvp8t5OzC"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldgEjOEdhUgBuUpL",
                            "name": "statusReasonSwitch"
                        },
                        {
                            "type": "url",
                            "id": "fldFhnjOgzPXoQQbM",
                            "name": "widgetConfigUrlOk",
                            "description": "PAYOUT: URL to redirect after OK transfers"
                        },
                        {
                            "type": "url",
                            "id": "fldyBj3VjZfphfqhf",
                            "name": "widgetConfigUrlKo",
                            "description": "PAYOUT: URL to redirect after KO transfers\n"
                        },
                        {
                            "type": "url",
                            "id": "fldLSY6iQZDeRLS9N",
                            "name": "widgetConfigUrlCancel",
                            "description": "PAYOUT: URL to redirect after Canceled transfers\n"
                        },
                        {
                            "type": "url",
                            "id": "fldOc0Kd1JhHh7oAg",
                            "name": "widgetConfigUrlLogo",
                            "description": "PAYOUT: URL of the company's logo"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldtDMvUKgQdBciod",
                            "name": "widgetConfigLang",
                            "description": "PAYOUT: Language code in ISO_639-1 format. Default: ES"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld9rKH6kYKxZxInI",
                            "name": "recipientFullName",
                            "description": "PAYOUT: Beneficiary Full Name"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldv93CdxsD631N4c",
                            "name": "recipientIdentificationType",
                            "description": "PAYOUT: Identification Number without spaces"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMBz3b5wsjCdpkM",
                            "name": "recipientIdentificationNumber",
                            "description": "PAYOUT: Type of Identification Document. Allowed: NATIONAL_ID\nRESIDENCE_PERMIT\nNATIONAL_TAX_NUMBER\nPASSPORT"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldXquqcw1FvmmpuI",
                            "name": "sourceWalletId"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                }
                            },
                            "id": "fldWfV9BJUg7lIUek",
                            "name": "chargeDate",
                            "description": "PAYIN \nRequested date on which the account should be debited."
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldTi0OsqaSZzGT7i",
                            "name": "mandateId",
                            "description": "PAYIN: Mandate Identifier"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldXPd38kma6s3ZYC",
                            "name": "recipientAccount",
                            "description": "PAYOUT: IBAN or Account Hash\n\n"
                        },
                        {
                            "type": "url",
                            "id": "flddt1rYlGmlCitu0",
                            "name": "clientWidgetURL"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldIbIaxG08SC2meg",
                            "name": "responseId"
                        },
                        {
                            "type": "url",
                            "id": "fld3qSDYLeMXbGVfe",
                            "name": "url",
                            "description": "PAYIN webhook"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/iijo1v9feycibmzvt36y1wgpuhkia5o5?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldUHZRHCJXzd6TO6",
                            "name": "webhookRefund"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/8lnhbqa0n7n2mem3tjexvlmbxev933vm?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldg2jcMHM1Mz6Wel",
                            "name": "webhookCreateDDPayin"
                        },
                        {
                            "type": "singleLineText",
                            "id": "flduosKqb7aijp4p5",
                            "name": "xRequestCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld70mQEaLv91MwNo",
                            "name": "errorCode"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldaghxt8ENGxNNUJ",
                            "name": "errorMessage"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldNUv7WMz5E4V4VQ",
                            "name": "recordID"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblfOJweNqokTr6C6",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldaVQExOVNrHFGTj"
                            },
                            "id": "fldlIFWV1pbTVrJQM",
                            "name": "linkWallet"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/pdlywtnjybdoxuiuf5i8ths876x61itd?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldI4ZyeLBGG5jiOU",
                            "name": "webhookCreatePayout"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldCVhKiHs0h8ROUV}/100",
                                "referencedFieldIds": [
                                    "fldCVhKiHs0h8ROUV"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldShiKteH382I7Un",
                            "name": "amountEuros"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "Europe/Madrid"
                            },
                            "id": "fldKZyvIl06Jbm83u",
                            "name": "dateReviewAllTransactions"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selcjGj7TuVaXlomS",
                                        "name": "Transactions API call",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selvIEpp81Yn8BfIP",
                                        "name": "Operativa Advancing",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "seld5ImxoWAApl9id",
                                        "name": "Webhook DDPayin",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldeinTCx83B4pnL8",
                            "name": "creationSource"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH(\n  {fldywz73aWOzLAAdp},\n  \"DIRECT_DEBIT_PAY_IN\",{fldg2jcMHM1Mz6Wel},\n  \"PAY_OUT\",{fldI4ZyeLBGG5jiOU},\n  \"PASSIVE_PAY_IN\",{fldICP5HmURyjbSqO},\n  \"PAY_IN\",{fldGofelhEuQVGxAb})&\"&env=\"&{fldmMDfgUfR7NJzrI}",
                                "referencedFieldIds": [
                                    "fldywz73aWOzLAAdp",
                                    "fldg2jcMHM1Mz6Wel",
                                    "fldI4ZyeLBGG5jiOU",
                                    "fldICP5HmURyjbSqO",
                                    "fldGofelhEuQVGxAb",
                                    "fldmMDfgUfR7NJzrI"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldMQ62AaPLNVScux",
                            "name": "webhookCreateSwitch"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblWqOI2pS09kBfj7",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldUYx7yFlCTsyYY2"
                            },
                            "id": "fldCXxAjHjQJVhndH",
                            "name": "linkTransactionQuerys"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true
                            },
                            "id": "fldhUCi1g1IVZZ9Ce",
                            "name": "linkTransactionRefund"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/v77a63igv4mhlsvdw0otexnpgqli43ic?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldAp0IKlfwb0UXgJ",
                            "name": "webhookReject"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldmwDXM3pzmG9qfN",
                            "name": "errorScenario"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH(\n  {fldywz73aWOzLAAdp},\n  \"PAY_OUT\",-1,\n  \"PAY_OUT_REFUND\",1,\n  \"PAY_IN\",1,\n  \"PAY_IN_REFUND\",-1,\n  \"DIRECT_DEBIT_PAY_IN\",1,\n  \"DIRECT_DEBIT_PAY_IN_REFUND\",-1,\n  \"DIRECT_DEBIT_PAY_OUT_REFUND\",1,\n  \"DIRECT_DEBIT_PAY_OUT\",-1,\n  \"FEE\",-1,\n  \"FEE_REFUND\",-1\n  )*{fldShiKteH382I7Un}\n",
                                "referencedFieldIds": [
                                    "fldywz73aWOzLAAdp",
                                    "fldShiKteH382I7Un"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldUNm3x4CuLfvfhV",
                            "name": "amountNeto"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/xtg1h0uc7r6j6fc17kxyai2ujoafdje4?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldXd2ee6Y3VLYDzV",
                            "name": "webhookGet"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldSvZaVXDhgdtEQu",
                            "name": "getJson"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [
                                    "fldhSwQkyqtSNbGwC"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "local",
                                            "format": "l"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldi8kUVo76o1jY5t",
                            "name": "dateStatusModified"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/vsd01cb819ph3hc043txcu5x8rjy80wb?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldICP5HmURyjbSqO",
                            "name": "webhookCreatePassivePayin"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "Europe/Madrid"
                                    }
                                }
                            },
                            "id": "fldSo7Vz8bMfYrXit",
                            "name": "dateModified"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selXBB50K10EsUciu",
                                        "name": "creditCard",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selDgQsUOTfwGqrrq",
                                        "name": "accountToAccount",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldv1EEQbs9VGC2Id",
                            "name": "paymentMethod"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "seliW7yMBXbjBSXAX",
                                        "name": "NATIONAL_ID",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selHuGa7OKPfbIQvV",
                                        "name": "RESIDENCE_PERMIT",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "sel187GCIYN7pfqgH",
                                        "name": "NATIONAL_TAX_NUMBER",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "selik6wtrj1MpdpWn",
                                        "name": "PASSPORT",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldDdqCwZSU2QzMaV",
                            "name": "sourceIdentificationType"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldCbkbeEMYjbH9ii",
                            "name": "sourceIdentificationNumber"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldFODVRG8GAFn2eU",
                            "name": "sourceCountry"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/tqashcbu3vzc79nncfwf86sllf8jp865?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldGofelhEuQVGxAb",
                            "name": "webhookCreatePayin"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://advancing.flutterflow.app/pasarela?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld7o6JEkqHnFSlva",
                            "name": "flutterflowURL"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldoXYz0njrU3as7i",
                            "name": "inmueble"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fldv1EEQbs9VGC2Id}=\"creditCard\",\"true\",\"false\")",
                                "referencedFieldIds": [
                                    "fldv1EEQbs9VGC2Id"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldWietztY99YL9Sq",
                            "name": "enableCreditCard"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fldv1EEQbs9VGC2Id}=\"accountToAccount\",\"true\",\"false\")",
                                "referencedFieldIds": [
                                    "fldv1EEQbs9VGC2Id"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld55Od88P7mjH0Rj",
                            "name": "enableAccountToAccount"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldX8dI3S6k1SNgCA",
                                "fieldIdInLinkedTable": "fldxlDvsvVakclZfI",
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldbWhKd6fFCQJcMK",
                            "name": "linkCashflowsImporteNeto"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblx3jaQmilKY8jIF",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldIYCpPA7anGY2bR"
                            },
                            "id": "fldVTxJFZrJmMGZLU",
                            "name": "linkTransactionBatches"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVTxJFZrJmMGZLU",
                                "fieldIdInLinkedTable": "fldOE6aauDB6L8QGg",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldubuz0Bwz9ciGt6",
                            "name": "linkTransactionBatchesFechaInicioMonth"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVTxJFZrJmMGZLU",
                                "fieldIdInLinkedTable": "fldr0s426x7jz7ncE",
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldyIiHqJTUSqlQbC",
                            "name": "linkTransactionBatchesFechaInicioYear"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel1xMQCsq6MIrc63",
                                        "name": "Pendiente",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selq59qeHD86QurBv",
                                        "name": "Aceptada",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "selX56fWi90RVYlPS",
                                        "name": "Rechazada",
                                        "color": "redBright"
                                    }
                                ]
                            },
                            "id": "fldHXqSxnDySmvB0R",
                            "name": "statusAprobacion"
                        },
                        {
                            "type": "lastModifiedBy",
                            "id": "fldGhEswfcCdZJSBd",
                            "name": "aprobadoPor"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [
                                    "fldHXqSxnDySmvB0R"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "local",
                                            "format": "l"
                                        },
                                        "timeFormat": {
                                            "name": "12hour",
                                            "format": "h:mma"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldUVruNuEg6IOJeS",
                            "name": "dateLastModifiedBooleanAprobacion"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "MONTH({fldWfV9BJUg7lIUek})",
                                "referencedFieldIds": [
                                    "fldWfV9BJUg7lIUek"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldjliY2MiyMzQCnR",
                            "name": "chargeDateMonth"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "YEAR({fldWfV9BJUg7lIUek})",
                                "referencedFieldIds": [
                                    "fldWfV9BJUg7lIUek"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fld9Fh0RfrBApQOuM",
                            "name": "chargeDateYear"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF(\n  {fldVTxJFZrJmMGZLU},\n  IF(\n    AND({fldjliY2MiyMzQCnR}={fldubuz0Bwz9ciGt6},{fld9Fh0RfrBApQOuM}={fldyIiHqJTUSqlQbC}),\n    \"Ok\",\n    \"Batch erróneo\"\n  ),\"Buscar\")",
                                "referencedFieldIds": [
                                    "fldVTxJFZrJmMGZLU",
                                    "fldjliY2MiyMzQCnR",
                                    "fldubuz0Bwz9ciGt6",
                                    "fld9Fh0RfrBApQOuM",
                                    "fldyIiHqJTUSqlQbC"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "Ok",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selxSNgepQe1cLTpT",
                                                "name": "Buscar",
                                                "color": "yellowLight1"
                                            },
                                            {
                                                "id": "selRBmzqKfacwUi3r",
                                                "name": "Batch erróneo",
                                                "color": "redLight1"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldSh6ypFBa2jF3tk",
                            "name": "findTransactionBatch"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "AND({fldjliY2MiyMzQCnR}={fldubuz0Bwz9ciGt6},{fld9Fh0RfrBApQOuM}={fldyIiHqJTUSqlQbC})",
                                "referencedFieldIds": [
                                    "fldjliY2MiyMzQCnR",
                                    "fldubuz0Bwz9ciGt6",
                                    "fld9Fh0RfrBApQOuM",
                                    "fldyIiHqJTUSqlQbC"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldpVU2zKc31yvxLb",
                            "name": "findTransactionBatch copy"
                        },
                        {
                            "type": "multipleLookupValues",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldVTxJFZrJmMGZLU",
                                "fieldIdInLinkedTable": "fldVC3SwcQiX8f0l7",
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selkWCtzXYuzttG3q",
                                                "name": "Pendiente",
                                                "color": "yellowLight1"
                                            },
                                            {
                                                "id": "selkB0B7R7XthMAyM",
                                                "name": "Aceptada",
                                                "color": "tealLight1"
                                            },
                                            {
                                                "id": "selJ8pzXDm8hePGKu",
                                                "name": "Completada",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selj6p996qkL9j8aC",
                                                "name": "Cancelada",
                                                "color": "redLight1"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldkMWQUpFWDrUALb",
                            "name": "linkRemesaStatus"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selrl8UDdwLBFfcvl",
                                        "name": "PROD",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "sellh62KqY9sIzpFM",
                                        "name": "ON",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldmMDfgUfR7NJzrI",
                            "name": "env"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/tqashcbu3vzc79nncfwf86sllf8jp865?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "flds8cAxGmHvw3Dxc",
                            "name": "webhookCreateTPV"
                        },
                        {
                            "type": "createdTime",
                            "options": {
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldewHlLk86YTjwHi",
                            "name": "fechaCreacionAirtable"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/o2cnl4xfgdskxasi38eogllxyuqbc659?recordID=\"&RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldf15dkgKw8xCHs9",
                            "name": "webhookRefundVPOS"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldWdBDV3ohN4artO",
                            "name": "event"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldh8EkWiG4tQToXQ",
                            "name": "signatureLast"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "seldlWoCLMJhbneC3",
                                        "name": "pending",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selYWEfYwmoKQvCjp",
                                        "name": "true",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "selEUqLwHQVt8sUfn",
                                        "name": "false",
                                        "color": "redBright"
                                    }
                                ]
                            },
                            "id": "fldE5X5pXnqFowvC4",
                            "name": "signatureValidation"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldFywRUKoiEu8dyN",
                            "name": "eventDate"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwtJuxOTGn1Ou9Ir",
                            "name": "Grid view",
                            "type": "grid"
                        },
                        {
                            "id": "viwIvSoPWJq8n42mJ",
                            "name": "Vinculadas a cashflows",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl7AXtuxbhJVT0E1",
                    "name": "webhooks",
                    "primaryFieldId": "fldTp2eGv4v9HiDJq",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldTp2eGv4v9HiDJq",
                            "name": "index"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld3MgC6C5XaYJy0U",
                            "name": "event"
                        },
                        {
                            "type": "url",
                            "id": "fld5HSmRDP3bDJZ7w",
                            "name": "webhook"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldDPKGbe9KWCN8cM",
                            "name": "createdAt"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldCtaRHjNJ3lLoOO",
                            "name": "webhookID"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selSpbahKgOpqKwpW",
                                        "name": "Event",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "sel8qurCutUvnm0Wz",
                                        "name": "Model",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldBpXpa3uZ7MYrXk",
                            "name": "type"
                        },
                        {
                            "type": "button",
                            "id": "fldb3RsRyymY5C8J1",
                            "name": "btn"
                        },
                        {
                            "type": "button",
                            "id": "fldiNqvQcOLp1ARrn",
                            "name": "btnOLD"
                        },
                        {
                            "type": "button",
                            "id": "fld9ZOR9VlfVOfycT",
                            "name": "btnUnsuscribe"
                        },
                        {
                            "type": "button",
                            "id": "fldUSEI43DYLut93v",
                            "name": "btnUnsuscribeOLD"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selKE3AchGZ4PBsQP",
                                        "name": "Integration",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selsXP1PhykV4RRaW",
                                        "name": "TPV",
                                        "color": "blueLight1"
                                    },
                                    {
                                        "id": "selwaHOINuOArVFZC",
                                        "name": "ON",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "seltM35pnmgYXiVGD",
                                        "name": "PROD",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldlAT9h5CwM1xdUh",
                            "name": "environment"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwU3x5yjyenbr5hD",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblKokQj5gQUWs5WU",
                    "name": "Imported table",
                    "primaryFieldId": "fldl1DHCqvld5pSQO",
                    "fields": [
                        {
                            "type": "multilineText",
                            "id": "fldl1DHCqvld5pSQO",
                            "name": "index"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld8JzO7TTIGFORMM",
                            "name": "concept"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selYHTBipPlBhdlBk",
                                        "name": "EUR",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldIVB8JknzeWTyZZ",
                            "name": "moneyCurrency"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldw03GeMD5zJIX2B",
                            "name": "moneyAmount"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldU03xMj2idYK6V4",
                            "name": "sourceWalletId"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selERKpRs0cVr4NtX",
                                        "name": "WALLET",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fld66DiCwFtnaP6ZY",
                            "name": "sourceType"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selSWhILg2RBcrcpU",
                                        "name": "BANK",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldO7IHTdTJcPHsIw",
                            "name": "recipientType"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldxMQ0Zf2voWaXVp",
                            "name": "createdAt"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel7CMMtd4qtE0Gup",
                                        "name": "ES7921000813610123456789",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldPCLND5LiqaPjch",
                            "name": "recipientAccount"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldu908IN1gqJcxZb",
                            "name": "recipientFullName"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selEDjNykskww2Ie1",
                                        "name": "NATIONAL_ID",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldPrD1qjK5Wvi8sl",
                            "name": "recipientIdentificationType"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldWfJmK7ZFUEvAcA",
                            "name": "recipientIdentificationNumber"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selHsIfTQn1jjx4wB",
                                        "name": "http://example.com/ok",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fld57zkudcy4QZ8dG",
                            "name": "widgetConfigUrlUrlOK"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selhbOmV3JAkmScHj",
                                        "name": "http://example.com/ko",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fld6K3zm35dSYHoML",
                            "name": "widgetConfigUrlUrlKO"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selcH7pSaxYZxYJI0",
                                        "name": "http://example.com/cancel",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldUzgXOOjzaCTvoR",
                            "name": "widgetConfigUrlUrlCancel"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel8iub2gm55ZL2RZ",
                                        "name": "http://example.com/your_logo",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldWrlLlxW72e9p8B",
                            "name": "widgetConfigUrlUrlLogo"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selA6PNmho2XsM5B2",
                                        "name": "ES",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fld2CdI3R8b1NlRwH",
                            "name": "widgetConfigLang"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "client"
                            },
                            "id": "fldpzF5R2F9d9X2bj",
                            "name": "updatedAt"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldJrTidCP5U2ANnA",
                            "name": "transactionId"
                        },
                        {
                            "type": "multilineText",
                            "id": "fld9yT938O5oocoBi",
                            "name": "reference"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selh5TFkgfVXKstQ1",
                                        "name": "PAY_OUT",
                                        "color": "blueLight2"
                                    }
                                ]
                            },
                            "id": "fldXYMQJOFHUjT4cD",
                            "name": "transactionType"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldm9J6U1Vq5cyoKX",
                            "name": "status"
                        },
                        {
                            "type": "url",
                            "id": "fldj8q34Xa8AUXzCY",
                            "name": "clientWidgetUrl"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldxyXK1NSZA7BjzA",
                            "name": "statusReason",
                            "description": "SepaReasonCode"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH({fldxyXK1NSZA7BjzA},\n    \"AC01\", \"Transacción no reconocida\",\n    \"AC04\", \"Cuenta no válida\",\n    \"AC06\", \"Fondos insuficientes\",\n    \"AG01\", \"Aceptación de la instrucción de pago\",\n    \"AG02\", \"Aceptación con condiciones\",\n    \"AM04\", \"Rechazo por solicitud de corrección\",\n    \"AM05\", \"Rechazo por error técnico\",\n    \"BE01\", \"Error en el formato del mensaje\",\n    \"BE05\", \"Información no válida\",\n    \"CNOR\", \"Transacción no reconocida por el banco receptor\",\n    \"DNOR\", \"No se puede procesar la transacción\",\n    \"FF01\", \"Error en la transacción\",\n    \"MD01\", \"Problemas de cumplimiento normativo\",\n    \"MD02\", \"Instrucción de pago no aceptada\",\n    \"MD06\", \"Orden de pago rechazada por el banco\",\n    \"MD07\", \"Instrucción no procesable\",\n    \"MS02\", \"Problemas de autenticación\",\n    \"MS03\", \"Instrucción con datos incorrectos\",\n    \"RC01\", \"Rechazo por falta de fondos\",\n    \"RR01\", \"Rechazo por cuenta cerrada\",\n    \"RR02\", \"Rechazo por cuenta bloqueada\",\n    \"RR03\", \"Rechazo por información insuficiente\",\n    \"RR04\", \"Rechazo por transacción no permitida\",\n    \"SL01\", \"Instrucción de pago exitosa\",\n    \"TECH\", \"Error técnico en el procesamiento\"\n)\n",
                                "referencedFieldIds": [
                                    "fldxyXK1NSZA7BjzA"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldwVhZA0gsQVN8V7",
                            "name": "statusReasonSwitch"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwbBHnC0n5F1ohyt",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblTXS9SRt31j2RDr",
                    "name": "tokens",
                    "primaryFieldId": "fld7kqV0o9XSn6pLx",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fld7kqV0o9XSn6pLx",
                            "name": "Name"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sel4b7PT0nfsz8rdG",
                                        "name": "access",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selNDpEZ0sqCqGPf5",
                                        "name": "refresh",
                                        "color": "cyanLight2"
                                    }
                                ]
                            },
                            "id": "fldGgzrgB0hLcSyzd",
                            "name": "type"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD(\n  {fldlHMN88DUXvfypt},1,\nSWITCH({fldGgzrgB0hLcSyzd},\n\"access\",\"hour\",\n\"refresh\",\"days\"))",
                                "referencedFieldIds": [
                                    "fldlHMN88DUXvfypt",
                                    "fldGgzrgB0hLcSyzd"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "local",
                                            "format": "l"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "Europe/Madrid"
                                    }
                                }
                            },
                            "id": "fldnE8GdiogIlJeSu",
                            "name": "expirationDate"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldkEa7OFP9D3TX72",
                            "name": "token"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldnE8GdiogIlJeSu}>NOW()",
                                "referencedFieldIds": [
                                    "fldnE8GdiogIlJeSu"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fld59urkSZUs920Ee",
                            "name": "valid"
                        },
                        {
                            "type": "createdTime",
                            "options": {
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "Europe/Madrid"
                                    }
                                }
                            },
                            "id": "fldlHMN88DUXvfypt",
                            "name": "creationDate"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selrEpjyjXj7ZZs9e",
                                        "name": "ON",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selU7njvurPhw5ouy",
                                        "name": "TPV",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selIkMahFahsBKc1p",
                                        "name": "PROD",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldIi2uRd2vN8ZjeU",
                            "name": "environment"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwauAtE4NdJKh2Zd",
                            "name": "Grid view",
                            "type": "grid"
                        },
                        {
                            "id": "viwJOQXVIIGglZNxL",
                            "name": "Access valid",
                            "type": "grid"
                        },
                        {
                            "id": "viwMh1azurhK2lHOR",
                            "name": "Refresh valid",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblfOJweNqokTr6C6",
                    "name": "wallet",
                    "primaryFieldId": "fldvQbYVetoZS5AHN",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldvQbYVetoZS5AHN",
                            "name": "Name"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldVYguVZzkW4GbTJ",
                            "name": "walletID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldwDqyIijIAjdSr8",
                            "name": "iban"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selbD3wZfNa0FCwHQ",
                                        "name": "Todo",
                                        "color": "redLight2"
                                    },
                                    {
                                        "id": "selHcQn91KQFdet7P",
                                        "name": "In progress",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selO0Um08f6PQtHby",
                                        "name": "Done",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldn5qNHaAdexqVnq",
                            "name": "Status"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "RECORD_ID()",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldttDm3HuH3r6Tsg",
                            "name": "recordID"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldwJbc4MkKgM1NKz",
                            "name": "balance"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldeLrk43of8b1LBr",
                            "name": "outstanding_incoming_balance"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fldeI5DSan88GQDC0",
                            "name": "outstanding_outgoing_balance"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldlIFWV1pbTVrJQM"
                            },
                            "id": "fldaVQExOVNrHFGTj",
                            "name": "transactions"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldwJbc4MkKgM1NKz}/100",
                                "referencedFieldIds": [
                                    "fldwJbc4MkKgM1NKz"
                                ],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "flduOckXo6lbKWdfL",
                            "name": "balanceEuro"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "sellZzRUZxspN6VJ7",
                                        "name": "ON",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selQATpJdAKZ8V2eZ",
                                        "name": "TPV",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "sellJRR0dwTpmk3W6",
                                        "name": "PROD",
                                        "color": "orangeLight1"
                                    }
                                ]
                            },
                            "id": "fldA9aHdgOnCZrtYq",
                            "name": "environment"
                        },
                        {
                            "type": "button",
                            "id": "fldRO61Cqp8itJBGs",
                            "name": "btnView"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwxZfOe1mJQpmPCD",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblWqOI2pS09kBfj7",
                    "name": "transactionQuerys",
                    "primaryFieldId": "fldHVIrou5C3KCauq",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldHVIrou5C3KCauq",
                            "name": "Name"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldehST6TdCMjZOPo",
                            "name": "fromDate"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldvQtzzxiHa8kKXr",
                            "name": "toDate"
                        },
                        {
                            "type": "number",
                            "options": {
                                "precision": 0
                            },
                            "id": "fld6qpxrB7kG01YpW",
                            "name": "items"
                        },
                        {
                            "type": "multipleSelects",
                            "options": {
                                "choices": [
                                    {
                                        "id": "seloDZG5PkcC9jGqL",
                                        "name": "PAY_IN",
                                        "color": "redLight2"
                                    },
                                    {
                                        "id": "seljJLpxrrWaopTEn",
                                        "name": "PAY_OUT",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selEY62NftvtlPXlC",
                                        "name": "PAY_OUT_REFUND",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "sel3kBRwZ9zQPmIUP",
                                        "name": "DIRECT_DEBIT_PAY_IN",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selLW2H4JO7uqHcwJ",
                                        "name": "DIRECT_DEBIT_PAY_IN_REFUND",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "sel77f3jlcBZetfzp",
                                        "name": "DIRECT_DEBIT_PAY_OUT",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selYPvsc7mzW2OIc9",
                                        "name": "DIRECT_DEBIT_PAY_OUT_REFUND",
                                        "color": "orangeLight2"
                                    },
                                    {
                                        "id": "selcaoIIPU5nkDyud",
                                        "name": "DIRECT_DEBIT_PAY_OUT_B2B",
                                        "color": "pinkLight2"
                                    },
                                    {
                                        "id": "selH8U0YD8MxNYDLn",
                                        "name": "DIRECT_DEBIT_PAY_OUT_B2B_REFUND",
                                        "color": "purpleLight2"
                                    },
                                    {
                                        "id": "seldC8XUr2lL8S7Qj",
                                        "name": "FEE",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selH4AQsPnokpwPcS",
                                        "name": "FEE_REFUND",
                                        "color": "blueLight1"
                                    }
                                ]
                            },
                            "id": "fldVofTMMv3wGrv0O",
                            "name": "transactionTypes"
                        },
                        {
                            "type": "multipleSelects",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selKhxejvfkOWGqlo",
                                        "name": "AUTHORIZED",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selJ9FlZetVxNLCQw",
                                        "name": "CANCELLED",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "sell3m6bQ1DbUaoS0",
                                        "name": "CANCELLATION_REQUESTED",
                                        "color": "tealLight2"
                                    },
                                    {
                                        "id": "sel5Ji5znypINnEFV",
                                        "name": "COMPLETED",
                                        "color": "greenLight2"
                                    },
                                    {
                                        "id": "selu3ITfkYGbLgB1m",
                                        "name": "ERROR",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "selM8FcSQx8CqDQbc",
                                        "name": "FRAUD",
                                        "color": "orangeLight2"
                                    },
                                    {
                                        "id": "sel1jPIYvygseRFwK",
                                        "name": "NEW",
                                        "color": "redLight2"
                                    },
                                    {
                                        "id": "selOsZhdrXllgIO2R",
                                        "name": "PENDING_CONFIRMATION",
                                        "color": "pinkLight2"
                                    },
                                    {
                                        "id": "sel5VfwRUsSmp2mwI",
                                        "name": "REFUNDED",
                                        "color": "purpleLight2"
                                    },
                                    {
                                        "id": "selTxBlNG9uRhyZ8X",
                                        "name": "REQUESTED",
                                        "color": "grayLight2"
                                    },
                                    {
                                        "id": "selYjWRfgD2q1nSGq",
                                        "name": "REJECTED",
                                        "color": "blueLight1"
                                    },
                                    {
                                        "id": "selB2jX5PP5gouITT",
                                        "name": "EXPIRED",
                                        "color": "cyanLight1"
                                    }
                                ]
                            },
                            "id": "fldWziIDu1lO7zcay",
                            "name": "transactionStatus"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "\"https://hook.eu1.make.com/tp5kixints9gmqf90z4s9babpt3huxjp?recordID=\"&RECORD_ID()&\"&env=\"&{fldjZKWwFFDsvHaEe}\n",
                                "referencedFieldIds": [
                                    "fldjZKWwFFDsvHaEe"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldnanccagW37Tvpz",
                            "name": "webhookGet"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldCXxAjHjQJVhndH"
                            },
                            "id": "fldUYx7yFlCTsyYY2",
                            "name": "linkTransactions"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldUYx7yFlCTsyYY2"
                            },
                            "id": "fldAAgbN3Huk0eTUa",
                            "name": "Transacciones"
                        },
                        {
                            "type": "rollup",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldUYx7yFlCTsyYY2",
                                "fieldIdInLinkedTable": "fldUNm3x4CuLfvfhV",
                                "referencedFieldIds": [],
                                "result": {
                                    "type": "currency",
                                    "options": {
                                        "precision": 2,
                                        "symbol": "€"
                                    }
                                }
                            },
                            "id": "fldwJVL4lsEFznMOe",
                            "name": "linkTransaccionesNeto"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selaWzAqWHy1ZXIVn",
                                        "name": "ON",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selSy4klYiUGvTaTJ",
                                        "name": "PROD",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "sel8P7gzS5JLEtd52",
                                        "name": "TPV",
                                        "color": "tealLight2"
                                    }
                                ]
                            },
                            "id": "fldjZKWwFFDsvHaEe",
                            "name": "env"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selKeFFvUywrXVAY6",
                                        "name": "Pending",
                                        "color": "blueLight2"
                                    },
                                    {
                                        "id": "selMnqlt8s8zSW3wM",
                                        "name": "In progress",
                                        "color": "cyanLight2"
                                    },
                                    {
                                        "id": "selkVkklHGDfdCTpM",
                                        "name": "Done",
                                        "color": "greenBright"
                                    }
                                ]
                            },
                            "id": "fld2hNhrDsYHaLxp7",
                            "name": "queryStatus"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwMc3WarfMMztvR0",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblUW36QjhFtFnJUJ",
                    "name": "bankCodes",
                    "primaryFieldId": "fldnjohGIlmLdMF8K",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldnjohGIlmLdMF8K",
                            "name": "Name"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldLFKc3jVM2tpc7E",
                            "name": "directBIC"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldyM6V46nTe6zwkb",
                            "name": "indirectBIC"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMgwjh4kTC1CeGY",
                            "name": "bankCode"
                        }
                    ],
                    "views": [
                        {
                            "id": "viw6GCogTLrdiI91I",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblCPZ28co8v0rZWP",
                    "name": "bankCalendar",
                    "primaryFieldId": "fldzBc534hHvrR6An",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldzBc534hHvrR6An",
                            "name": "Name"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldhrExrNyCc9UBRT",
                            "name": "fecha"
                        }
                    ],
                    "views": [
                        {
                            "id": "viw4rqIjX1YcGaTpD",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblx3jaQmilKY8jIF",
                    "name": "transactionBatches",
                    "primaryFieldId": "flduCwaDW5XMxou8H",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "SWITCH(\n  MONTH({fldxusszrG05dzvcE}),\n  1,\"Enero\",\n  2,\"Febrero\",\n  3,\"Marzo\",\n  4,\"Abril\",\n  5,\"Mayo\",\n  6,\"Junio\",\n  7,\"Julio\",\n  8,\"Agosto\",\n  9,\"Septiembre\",\n  10,\"Octubre\",\n  11,\"Noviembre\",\n  12,\"Diciembre\")&\" \"&YEAR({fldxusszrG05dzvcE})",
                                "referencedFieldIds": [
                                    "fldxusszrG05dzvcE"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "flduCwaDW5XMxou8H",
                            "name": "index"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "Europe/Madrid"
                            },
                            "id": "fldxusszrG05dzvcE",
                            "name": "fechaInicio"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD(\n  DATEADD({fldxusszrG05dzvcE},1,'month'),\n  -1,\n  'second')",
                                "referencedFieldIds": [
                                    "fldxusszrG05dzvcE"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "Europe/Madrid"
                                    }
                                }
                            },
                            "id": "fldy7y9cA8NHLAiSg",
                            "name": "fechaFin"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD({fldxusszrG05dzvcE},1,'month')",
                                "referencedFieldIds": [
                                    "fldxusszrG05dzvcE"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "european",
                                            "format": "D/M/YYYY"
                                        },
                                        "timeFormat": {
                                            "name": "24hour",
                                            "format": "HH:mm"
                                        },
                                        "timeZone": "Europe/Madrid"
                                    }
                                }
                            },
                            "id": "fldvoh2TJtt3uKDJB",
                            "name": "fechaSiguiente"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblhE3J0X3Zg2CB1o",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldVTxJFZrJmMGZLU"
                            },
                            "id": "fldIYCpPA7anGY2bR",
                            "name": "linkTransactions"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "MONTH({fldxusszrG05dzvcE})",
                                "referencedFieldIds": [
                                    "fldxusszrG05dzvcE"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldOE6aauDB6L8QGg",
                            "name": "fechaInicioMonth"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "YEAR({fldxusszrG05dzvcE})",
                                "referencedFieldIds": [
                                    "fldxusszrG05dzvcE"
                                ],
                                "result": {
                                    "type": "number",
                                    "options": {
                                        "precision": 0
                                    }
                                }
                            },
                            "id": "fldr0s426x7jz7ncE",
                            "name": "fechaInicioYear"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblx3jaQmilKY8jIF",
                                "isReversed": false,
                                "prefersSingleRecordLink": true
                            },
                            "id": "fld1rsmFgVMXTBzhF",
                            "name": "linkTransactionBatchesAnterior"
                        },
                        {
                            "type": "count",
                            "options": {
                                "isValid": true,
                                "recordLinkFieldId": "fldIYCpPA7anGY2bR"
                            },
                            "id": "fldychUh9G9qZUq1Y",
                            "name": "linkTransactionsCount"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selkWCtzXYuzttG3q",
                                        "name": "Pendiente",
                                        "color": "yellowLight1"
                                    },
                                    {
                                        "id": "selkB0B7R7XthMAyM",
                                        "name": "Aceptada",
                                        "color": "tealLight1"
                                    },
                                    {
                                        "id": "selJ8pzXDm8hePGKu",
                                        "name": "Completada",
                                        "color": "greenBright"
                                    },
                                    {
                                        "id": "selj6p996qkL9j8aC",
                                        "name": "Cancelada",
                                        "color": "redLight1"
                                    }
                                ]
                            },
                            "id": "fldVC3SwcQiX8f0l7",
                            "name": "status"
                        },
                        {
                            "type": "lastModifiedBy",
                            "id": "fldBkYHhhz1aDgkl4",
                            "name": "statusModificadoPor"
                        },
                        {
                            "type": "lastModifiedTime",
                            "options": {
                                "isValid": true,
                                "referencedFieldIds": [
                                    "fldVC3SwcQiX8f0l7"
                                ],
                                "result": {
                                    "type": "dateTime",
                                    "options": {
                                        "dateFormat": {
                                            "name": "local",
                                            "format": "l"
                                        },
                                        "timeFormat": {
                                            "name": "12hour",
                                            "format": "h:mma"
                                        },
                                        "timeZone": "client"
                                    }
                                }
                            },
                            "id": "fldbQM4ubUY48vZRq",
                            "name": "statusModificadoUltimaVez"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwdknascbcjtzUoh",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl4wzfXvZICfxqc0",
                    "name": "remesas",
                    "primaryFieldId": "fld8PjEzJoSLLDBAV",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATETIME_FORMAT({fld1jTryAGMTzCcM5},'YYYY-MM')",
                                "referencedFieldIds": [
                                    "fld1jTryAGMTzCcM5"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fld8PjEzJoSLLDBAV",
                            "name": "Name"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fld1jTryAGMTzCcM5",
                            "name": "fechaInicio"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "DATEADD({fld1jTryAGMTzCcM5},1,'month')",
                                "referencedFieldIds": [
                                    "fld1jTryAGMTzCcM5"
                                ],
                                "result": {
                                    "type": "date",
                                    "options": {
                                        "dateFormat": {
                                            "name": "us",
                                            "format": "M/D/YYYY"
                                        }
                                    }
                                }
                            },
                            "id": "fld70CiyyjXLzyrrB",
                            "name": "fechaFin"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldTbaecb3VfmQR3d"
                            },
                            "id": "fldHjP7a35Fcsp3zb",
                            "name": "linkCashflows"
                        },
                        {
                            "type": "multipleAttachments",
                            "options": {
                                "isReversed": false
                            },
                            "id": "fldvEOg2tFsO5QV1q",
                            "name": "Attachments"
                        },
                        {
                            "type": "aiText",
                            "options": {
                                "referencedFieldIds": [
                                    "fldvEOg2tFsO5QV1q"
                                ],
                                "prompt": [
                                    "You are a professional document analyst specializing in summarizing content from various file types. Your task is to extract key points and provide a concise summary of the content found in the attached files. Ensure that the summary captures the main ideas and any important details without including unnecessary information.\n\nAnalyze the content of the attached files to identify the main themes and significant details. Summarize these points clearly and concisely, ensuring that the summary is informative and relevant to the document's purpose.\n\nFormat your response as plain text, keeping it concise and to the point. If you cannot summarize the content, output \"Unable to summarize the content.\" Example: \"The document discusses the impact of climate change on polar bears, highlighting the loss of habitat and food sources.\" (Real examples should be longer and more detailed.)\n\nFiles:\n",
                                    {
                                        "field": {
                                            "fieldId": "fldvEOg2tFsO5QV1q"
                                        }
                                    }
                                ]
                            },
                            "id": "fldCkle19viGPpVG9",
                            "name": "Attachment Summary",
                            "description": "An AI generated summary of the Attachments field. Upload files to Attachments to generate a summary."
                        }
                    ],
                    "views": [
                        {
                            "id": "viwWa7JRPjYmTbwyB",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tblbahdQxmO5JOMqS",
                    "name": "Accounts",
                    "description": "system: Caixabank (Fintable)",
                    "primaryFieldId": "fld8hbXwthfoBziyt",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fld8hbXwthfoBziyt",
                            "name": "*Name"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldi0Djv6up2BgJfa",
                            "name": "**Institution"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "$"
                            },
                            "id": "fldILXbPSIknYhj5M",
                            "name": "**USD"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "$"
                            },
                            "id": "fldr5TmNVz0GWqtC1",
                            "name": "**EUR"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "$"
                            },
                            "id": "fldMkj3Up3wO7BSpH",
                            "name": "**CAD"
                        },
                        {
                            "type": "dateTime",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                },
                                "timeFormat": {
                                    "name": "24hour",
                                    "format": "HH:mm"
                                },
                                "timeZone": "Europe/Madrid"
                            },
                            "id": "fldClxzPijNobLdb7",
                            "name": "**Last Successful Update"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldUVkEJCCsMLpSTD",
                            "name": "Sync URL"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldwElB9RKvf3RIKs",
                            "name": "**Plaid Account ID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMuiXe2LrEc2NTO",
                            "name": "Fintable User"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldEzfXnqJUeI7Pbe",
                            "name": "Raw"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldLR7vyMKwTriWOI",
                            "name": "Sync Button"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl7La9hiBj30Ikp0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldX1svBUkzD8cmQg"
                            },
                            "id": "fldx5M1UeEOA1q9oO",
                            "name": "Transactions 2"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldWSPyCLKhsJ2rUe",
                            "name": "nombreInterno"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fld7ozaSDTpzfa9z4",
                            "name": "mandatosCaixa"
                        }
                    ],
                    "views": [
                        {
                            "id": "viw3mrJ5QjcfYPnDv",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl7La9hiBj30Ikp0",
                    "name": "Transactions",
                    "primaryFieldId": "fldpyRiHQRNq0e3dG",
                    "fields": [
                        {
                            "type": "singleLineText",
                            "id": "fldpyRiHQRNq0e3dG",
                            "name": "*Name"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": []
                            },
                            "id": "fldW8PBU0RGhWlexj",
                            "name": "**Category"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                }
                            },
                            "id": "fldY9EOzvEUpS6kET",
                            "name": "**Date"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "iso",
                                    "format": "YYYY-MM-DD"
                                }
                            },
                            "id": "fldfBZJsis9fD9pY9",
                            "name": "**Auth Date"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "$"
                            },
                            "id": "fld3GsWMq1E1kUPyR",
                            "name": "**USD"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "€"
                            },
                            "id": "fldyJyAvUGvyW7W9n",
                            "name": "**EUR"
                        },
                        {
                            "type": "currency",
                            "options": {
                                "precision": 2,
                                "symbol": "$"
                            },
                            "id": "fldwTrodTA2TcNQU4",
                            "name": "**CAD"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblbahdQxmO5JOMqS",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldx5M1UeEOA1q9oO"
                            },
                            "id": "fldX1svBUkzD8cmQg",
                            "name": "**Account"
                        },
                        {
                            "type": "checkbox",
                            "options": {
                                "icon": "thumbsUp",
                                "color": "greenBright"
                            },
                            "id": "fldOxXGbRoovREOEy",
                            "name": "**Pending"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldV34wadMyvPxTj3",
                            "name": "*Vendor"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldZ2gPuIJNHBfcWH",
                            "name": "**Raw"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldIRj3RvfNUKundv",
                            "name": "**Notes"
                        },
                        {
                            "type": "singleLineText",
                            "id": "flduUjUOeaNeOrcGM",
                            "name": "**Plaid TX ID"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldMsJhytWWVKTvFC",
                            "name": "*Sub-Account"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldVLoOdobs1Y1ByC"
                            },
                            "id": "fldfWnsujIsEMjxDN",
                            "name": "linkCashflows"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblWnB9SCfCFoXzfW",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldrIASxOpeyAWF81"
                            },
                            "id": "fldSItAZpGNN7Ts7j",
                            "name": "linkDeal"
                        },
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "IF({fldyJyAvUGvyW7W9n}>0,\"In\",\"Out\")",
                                "referencedFieldIds": [
                                    "fldyJyAvUGvyW7W9n"
                                ],
                                "result": {
                                    "type": "singleSelect",
                                    "options": {
                                        "choices": [
                                            {
                                                "id": "selFORMULADEFAULT",
                                                "name": "In",
                                                "color": "greenBright"
                                            },
                                            {
                                                "id": "selldGkQ0LiYYOgEQ",
                                                "name": "Out",
                                                "color": "redBright"
                                            }
                                        ]
                                    }
                                }
                            },
                            "id": "fldQi7lPtn4YqQSNo",
                            "name": "direccion"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblxY6upsLDmqzaaL",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldz6bEbVOE6rc6zQ"
                            },
                            "id": "fldNyHa686Ed6apqu",
                            "name": "linkCashflow"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl3PChHmHfWSzZVs",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldHp80JnVqfkp95s"
                            },
                            "id": "fldZKlJG9JDIb3Cow",
                            "name": "mandatosCaixa"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwUT44E5xJpcPjdl",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                },
                {
                    "id": "tbl3PChHmHfWSzZVs",
                    "name": "mandatosCaixa",
                    "primaryFieldId": "fldlAf6sOiT7lfCFX",
                    "fields": [
                        {
                            "type": "formula",
                            "options": {
                                "isValid": true,
                                "formula": "{fldvjcpXPUXS28WWe}&\" [Ref:\"&{fldaSk5aP3IHfr9Xa}&\"]\"",
                                "referencedFieldIds": [
                                    "fldvjcpXPUXS28WWe",
                                    "fldaSk5aP3IHfr9Xa"
                                ],
                                "result": {
                                    "type": "singleLineText"
                                }
                            },
                            "id": "fldlAf6sOiT7lfCFX",
                            "name": "index"
                        },
                        {
                            "type": "multilineText",
                            "id": "fldv60l40C5RtVz5B",
                            "name": "Notes"
                        },
                        {
                            "type": "singleCollaborator",
                            "id": "fld3matwQ53fVgKvf",
                            "name": "Assignee"
                        },
                        {
                            "type": "singleSelect",
                            "options": {
                                "choices": [
                                    {
                                        "id": "selyhzmRok0XOq1ni",
                                        "name": "Todo",
                                        "color": "redLight2"
                                    },
                                    {
                                        "id": "selEOSOJgRQAi4KyW",
                                        "name": "In progress",
                                        "color": "yellowLight2"
                                    },
                                    {
                                        "id": "sel7sKk4FM1rp233y",
                                        "name": "Done",
                                        "color": "greenLight2"
                                    }
                                ]
                            },
                            "id": "fldtTmFvZvhVaqwmK",
                            "name": "Status"
                        },
                        {
                            "type": "multipleAttachments",
                            "options": {
                                "isReversed": false
                            },
                            "id": "fldRmQv6EKjHunpnM",
                            "name": "Attachments"
                        },
                        {
                            "type": "aiText",
                            "options": {
                                "referencedFieldIds": [
                                    "fldRmQv6EKjHunpnM"
                                ],
                                "prompt": [
                                    "You are a professional document analyst specializing in summarizing content from various file types. Your task is to extract key points and provide a concise summary of the content found in the attached files. Ensure that the summary captures the main ideas and any important details without including unnecessary information.\n\nAnalyze the content of the attached files to identify the main themes and significant details. Summarize these points clearly and concisely, ensuring that the summary is informative and relevant to the document's purpose.\n\nFormat your response as plain text, keeping it concise and to the point. If you cannot summarize the content, output \"Unable to summarize the content.\" Example: \"The document discusses the impact of climate change on polar bears, highlighting the loss of habitat and food sources.\" (Real examples should be longer and more detailed.)\n\nFiles:\n",
                                    {
                                        "field": {
                                            "fieldId": "fldRmQv6EKjHunpnM"
                                        }
                                    }
                                ]
                            },
                            "id": "fldCfTxpMbsmNQS4u",
                            "name": "Attachment Summary",
                            "description": "An AI generated summary of the Attachments field. Upload files to Attachments to generate a summary."
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblYNdOLuMvpBavEu",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldiZEWwafITebXmH"
                            },
                            "id": "fldenH3Zj8NrpE0VY",
                            "name": "linkBalance"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tblN8MtBDlLSQyu9o",
                                "isReversed": false,
                                "prefersSingleRecordLink": true,
                                "inverseLinkFieldId": "fldEQMnRI4QOU2fcC"
                            },
                            "id": "fldvjcpXPUXS28WWe",
                            "name": "linkBankAccounts"
                        },
                        {
                            "type": "singleLineText",
                            "id": "fldaSk5aP3IHfr9Xa",
                            "name": "referencia"
                        },
                        {
                            "type": "date",
                            "options": {
                                "dateFormat": {
                                    "name": "european",
                                    "format": "D/M/YYYY"
                                }
                            },
                            "id": "fldGmg1JtBLX3wReX",
                            "name": "fechaFirma"
                        },
                        {
                            "type": "multipleRecordLinks",
                            "options": {
                                "linkedTableId": "tbl7La9hiBj30Ikp0",
                                "isReversed": false,
                                "prefersSingleRecordLink": false,
                                "inverseLinkFieldId": "fldZKlJG9JDIb3Cow"
                            },
                            "id": "fldHp80JnVqfkp95s",
                            "name": "linkTransactions"
                        }
                    ],
                    "views": [
                        {
                            "id": "viwNFkxiiiFUfwPJ4",
                            "name": "Grid view",
                            "type": "grid"
                        }
                    ]
                }
            ]
        },
        "headers": {
            "date": "Wed, 11 Feb 2026 08:42:44 GMT",
            "content-type": "application/json; charset=utf-8",
            "content-length": "109663",
            "connection": "close",
            "set-cookie": [
                "AWSALBTG=DR7926+zOIMm3kJOf43UvJWD+5rh6rdjDyAhPgXGZ4lAOMCE+rCPGvmfZRXDllBHyynZ+AQLlkk+S++R+0t4oNaqPhGfgTTV+mzEyH06uSynCv56Q2PlkA0xtlNmcTGEoOzT5h0a0WOprhdmoK8u95cDPpoMEzL70WgazLsIN0QaloIWl0s=; Expires=Wed, 18 Feb 2026 08:42:44 GMT; Path=/",
                "AWSALBTGCORS=DR7926+zOIMm3kJOf43UvJWD+5rh6rdjDyAhPgXGZ4lAOMCE+rCPGvmfZRXDllBHyynZ+AQLlkk+S++R+0t4oNaqPhGfgTTV+mzEyH06uSynCv56Q2PlkA0xtlNmcTGEoOzT5h0a0WOprhdmoK8u95cDPpoMEzL70WgazLsIN0QaloIWl0s=; Expires=Wed, 18 Feb 2026 08:42:44 GMT; Path=/; SameSite=None; Secure",
                "brw=brwCBFOJM5ZX7a2qe; path=/; expires=Thu, 11 Feb 2027 08:42:44 GMT; domain=.airtable.com; samesite=none; secure",
                "brwConsent=opt-out; path=/; expires=Wed, 11 Feb 2026 08:47:44 GMT; domain=.airtable.com; samesite=none; secure"
            ],
            "server": "Tengine",
            "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "DELETE,GET,OPTIONS,PATCH,POST,PUT",
            "access-control-allow-headers": "authorization,content-length,content-type,user-agent,x-airtable-application-id,x-airtable-user-agent,x-api-version,x-requested-with",
            "x-frame-options": "DENY",
            "x-content-type-options": "nosniff",
            "vary": "Accept-Encoding",
            "airtable-uncompressed-content-length": "109663",
            "airtable-datacenter-regions": "us-east-1"
        },
        "statusCode": 200
    }
]