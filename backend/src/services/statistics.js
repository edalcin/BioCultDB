/**
 * Statistics Service
 *
 * MongoDB aggregation pipelines for dashboard statistics
 * All queries only process approved references
 */

const database = require('../shared/database');
const config = require('../shared/config');
const logger = require('../shared/logger');
const { Status } = require('../models/Reference');

/**
 * Get top N most used plants across all communities
 * @param {number} limit - Number of results
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {nomeCientifico, nomeVernacular, count, communityCount, referenceCount}
 */
async function getTopPlants(limit = 10, filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      // Filtro de status aprovado
      { $match: { status: Status.APPROVED, ...filters } },

      // Desenrolar comunidades
      { $unwind: '$comunidades' },

      // Aplicar filtros de comunidade se existirem
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [{ $match: {
            ...(filters['comunidades.estado'] && { 'comunidades.estado': filters['comunidades.estado'] }),
            ...(filters['comunidades.tipo'] && { 'comunidades.tipo': filters['comunidades.tipo'] })
          }}]
        : []),

      // Desenrolar plantas
      { $unwind: '$comunidades.plantas' },

      // Desenrolar nomes científicos (pode ter múltiplos)
      { $unwind: { path: '$comunidades.plantas.nomeCientifico', preserveNullAndEmptyArrays: true } },

      // Filtrar plantas sem nome científico
      { $match: { 'comunidades.plantas.nomeCientifico': { $exists: true, $ne: null, $ne: '' } } },

      // Agrupar por nome científico
      {
        $group: {
          _id: '$comunidades.plantas.nomeCientifico',
          nomeVernacular: { $first: { $arrayElemAt: ['$comunidades.plantas.nomeVernacular', 0] } },
          count: { $sum: 1 },
          communities: { $addToSet: '$comunidades.nome' },
          references: { $addToSet: '$_id' }
        }
      },

      // Ordenar por contagem decrescente
      { $sort: { count: -1 } },

      // Limitar resultados
      { $limit: limit },

      // Projetar resultado final
      {
        $project: {
          _id: 0,
          nomeCientifico: '$_id',
          nomeVernacular: 1,
          count: 1,
          communityCount: { $size: '$communities' },
          referenceCount: { $size: '$references' }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Top plants query returned ${result.length} results`);

    return result;
  } catch (error) {
    logger.error('Top plants aggregation failed:', error.message);
    throw error;
  }
}

/**
 * Get total number of unique communities
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} {total, byType}
 */
async function getCommunityCount(filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },
      { $unwind: '$comunidades' },

      // Aplicar filtros
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [{ $match: {
            ...(filters['comunidades.estado'] && { 'comunidades.estado': filters['comunidades.estado'] }),
            ...(filters['comunidades.tipo'] && { 'comunidades.tipo': filters['comunidades.tipo'] })
          }}]
        : []),

      {
        $group: {
          _id: {
            nome: '$comunidades.nome',
            estado: '$comunidades.estado',
            municipio: { $ifNull: ['$comunidades.municipio', ''] }
          },
          tipo: { $first: '$comunidades.tipo' }
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: {
              tipo: '$tipo'
            }
          }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database('Community count aggregation completed');

    if (result.length === 0) {
      return { total: 0, byType: [] };
    }

    // Agregar contagem por tipo
    const typeCount = {};
    result[0].byType.forEach(item => {
      const tipo = item.tipo || 'Não especificado';
      typeCount[tipo] = (typeCount[tipo] || 0) + 1;
    });

    const byType = Object.entries(typeCount).map(([tipo, count]) => ({ tipo, count }));

    return {
      total: result[0].total,
      byType
    };
  } catch (error) {
    logger.error('Community count failed:', error.message);
    throw error;
  }
}

/**
 * Get reference count by status
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} {approved, pending, rejected, total}
 */
async function getReferenceCountByStatus(filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    // Remove status filter for this query (we want counts for all statuses)
    const { status, ...otherFilters } = filters;

    const pipeline = [
      { $match: otherFilters },

      // Aplicar filtros de comunidade se existirem
      ...(otherFilters['comunidades.estado'] || otherFilters['comunidades.tipo']
        ? [
            { $unwind: '$comunidades' },
            { $match: {
                ...(otherFilters['comunidades.estado'] && { 'comunidades.estado': otherFilters['comunidades.estado'] }),
                ...(otherFilters['comunidades.tipo'] && { 'comunidades.tipo': otherFilters['comunidades.tipo'] })
              }
            },
            {
              $group: {
                _id: '$_id',
                status: { $first: '$status' }
              }
            }
          ]
        : []),

      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();

    const counts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      total: 0
    };

    result.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    logger.database('Reference count by status completed');
    return counts;
  } catch (error) {
    logger.error('Reference count by status failed:', error.message);
    throw error;
  }
}

/**
 * Get top authors by number of publications
 * @param {number} limit - Number of results
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {author, count, samplePublications}
 */
async function getTopAuthors(limit = 10, filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },

      // Aplicar filtros de comunidade
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [
            { $unwind: '$comunidades' },
            { $match: {
                ...(filters['comunidades.estado'] && { 'comunidades.estado': filters['comunidades.estado'] }),
                ...(filters['comunidades.tipo'] && { 'comunidades.tipo': filters['comunidades.tipo'] })
              }
            },
            {
              $group: {
                _id: '$_id',
                autores: { $first: '$autores' },
                titulo: { $first: '$titulo' }
              }
            }
          ]
        : []),

      { $unwind: '$autores' },

      // Filtrar autores incompletos/apenas iniciais (menos de 4 caracteres geralmente são incompletos)
      { $match: { 'autores': { $regex: '^.{4,}' } } },

      {
        $group: {
          _id: '$autores',
          count: { $sum: 1 },
          publications: { $addToSet: '$titulo' }
        }
      },

      { $sort: { count: -1 } },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          author: '$_id',
          count: 1,
          samplePublications: { $slice: ['$publications', 3] }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Top authors query returned ${result.length} results`);

    return result;
  } catch (error) {
    logger.error('Top authors failed:', error.message);
    throw error;
  }
}

/**
 * Get number of references by state (for heat map)
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {state, count}
 */
async function getReferencesByState(filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },
      { $unwind: '$comunidades' },

      ...(filters['comunidades.tipo']
        ? [{ $match: { 'comunidades.tipo': filters['comunidades.tipo'] }}]
        : []),

      {
        $group: {
          _id: {
            referenceId: '$_id',
            estado: '$comunidades.estado'
          }
        }
      },

      {
        $group: {
          _id: '$_id.estado',
          count: { $sum: 1 }
        }
      },

      { $sort: { count: -1 } },

      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`References by state returned ${result.length} states`);

    return result;
  } catch (error) {
    logger.error('References by state failed:', error.message);
    throw error;
  }
}

/**
 * Get number of unique plants by state (for heat map)
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {state, count}
 */
async function getPlantsByState(filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },
      { $unwind: '$comunidades' },

      ...(filters['comunidades.tipo']
        ? [{ $match: { 'comunidades.tipo': filters['comunidades.tipo'] }}]
        : []),

      { $unwind: '$comunidades.plantas' },
      { $unwind: { path: '$comunidades.plantas.nomeCientifico', preserveNullAndEmptyArrays: true } },

      // Filtrar plantas sem nome científico
      { $match: { 'comunidades.plantas.nomeCientifico': { $exists: true, $ne: null, $ne: '' } } },

      {
        $group: {
          _id: {
            estado: '$comunidades.estado',
            planta: '$comunidades.plantas.nomeCientifico'
          }
        }
      },

      {
        $group: {
          _id: '$_id.estado',
          count: { $sum: 1 }
        }
      },

      { $sort: { count: -1 } },

      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Plants by state returned ${result.length} states`);

    return result;
  } catch (error) {
    logger.error('Plants by state failed:', error.message);
    throw error;
  }
}

/**
 * Get top communities by number of plants
 * @param {number} limit - Number of results
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {community, estado, municipio, plantCount}
 */
async function getTopCommunitiesByPlants(limit = 10, filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },
      { $unwind: '$comunidades' },

      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [{ $match: {
            ...(filters['comunidades.estado'] && { 'comunidades.estado': filters['comunidades.estado'] }),
            ...(filters['comunidades.tipo'] && { 'comunidades.tipo': filters['comunidades.tipo'] })
          }}]
        : []),

      {
        $project: {
          comunidade: '$comunidades.nome',
          estado: '$comunidades.estado',
          municipio: { $ifNull: ['$comunidades.municipio', 'Não especificado'] },
          plantCount: { $size: { $ifNull: ['$comunidades.plantas', []] } }
        }
      },

      {
        $group: {
          _id: {
            nome: '$comunidade',
            estado: '$estado',
            municipio: '$municipio'
          },
          totalPlants: { $sum: '$plantCount' }
        }
      },

      { $sort: { totalPlants: -1 } },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          community: '$_id.nome',
          estado: '$_id.estado',
          municipio: '$_id.municipio',
          plantCount: '$totalPlants'
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Top communities by plants returned ${result.length} results`);

    return result;
  } catch (error) {
    logger.error('Top communities by plants failed:', error.message);
    throw error;
  }
}

/**
 * Get references with most communities
 * @param {number} limit - Number of results
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {titulo, autores, ano, communityCount}
 */
async function getTopReferencesByCommunities(limit = 10, filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },

      // Aplicar filtros de comunidade
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [
            {
              $addFields: {
                filteredComunidades: {
                  $filter: {
                    input: '$comunidades',
                    as: 'com',
                    cond: {
                      $and: [
                        ...(filters['comunidades.estado']
                          ? [{ $eq: ['$$com.estado', filters['comunidades.estado']] }]
                          : [true]),
                        ...(filters['comunidades.tipo']
                          ? [{ $eq: ['$$com.tipo', filters['comunidades.tipo']] }]
                          : [true])
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                titulo: 1,
                autores: 1,
                ano: 1,
                communityCount: { $size: '$filteredComunidades' }
              }
            }
          ]
        : [
            {
              $project: {
                titulo: 1,
                autores: 1,
                ano: 1,
                communityCount: { $size: { $ifNull: ['$comunidades', []] } }
              }
            }
          ]),

      { $sort: { communityCount: -1 } },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          titulo: 1,
          autores: 1,
          ano: 1,
          communityCount: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Top references by communities returned ${result.length} results`);

    return result;
  } catch (error) {
    logger.error('Top references by communities failed:', error.message);
    throw error;
  }
}

/**
 * Get references with most plants
 * @param {number} limit - Number of results
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {titulo, autores, ano, plantCount}
 */
async function getTopReferencesByPlants(limit = 10, filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },

      // Aplicar filtros de comunidade se existirem
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [
            {
              $addFields: {
                filteredComunidades: {
                  $filter: {
                    input: '$comunidades',
                    as: 'com',
                    cond: {
                      $and: [
                        ...(filters['comunidades.estado']
                          ? [{ $eq: ['$$com.estado', filters['comunidades.estado']] }]
                          : [true]),
                        ...(filters['comunidades.tipo']
                          ? [{ $eq: ['$$com.tipo', filters['comunidades.tipo']] }]
                          : [true])
                      ]
                    }
                  }
                }
              }
            },
            {
              $addFields: {
                plantCount: {
                  $reduce: {
                    input: '$filteredComunidades',
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        { $size: { $ifNull: ['$$this.plantas', []] } }
                      ]
                    }
                  }
                }
              }
            }
          ]
        : [
            {
              $addFields: {
                plantCount: {
                  $reduce: {
                    input: '$comunidades',
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        { $size: { $ifNull: ['$$this.plantas', []] } }
                      ]
                    }
                  }
                }
              }
            }
          ]),

      { $sort: { plantCount: -1 } },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          titulo: 1,
          autores: 1,
          ano: 1,
          plantCount: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Top references by plants returned ${result.length} results`);

    return result;
  } catch (error) {
    logger.error('Top references by plants failed:', error.message);
    throw error;
  }
}

/**
 * Get publications by year (for timeline chart)
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of {year, count}
 */
async function getPublicationsByYear(filters = {}) {
  try {
    const collection = database.getCollection(config.database.collection);

    const pipeline = [
      { $match: { status: Status.APPROVED, ...filters } },

      // Aplicar filtros de comunidade
      ...(filters['comunidades.estado'] || filters['comunidades.tipo']
        ? [
            { $unwind: '$comunidades' },
            { $match: {
                ...(filters['comunidades.estado'] && { 'comunidades.estado': filters['comunidades.estado'] }),
                ...(filters['comunidades.tipo'] && { 'comunidades.tipo': filters['comunidades.tipo'] })
              }
            },
            {
              $group: {
                _id: '$_id',
                ano: { $first: '$ano' }
              }
            }
          ]
        : []),

      {
        $group: {
          _id: '$ano',
          count: { $sum: 1 }
        }
      },

      { $sort: { _id: 1 } },

      {
        $project: {
          _id: 0,
          year: '$_id',
          count: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    logger.database(`Publications by year returned ${result.length} years`);

    return result;
  } catch (error) {
    logger.error('Publications by year failed:', error.message);
    throw error;
  }
}

module.exports = {
  getTopPlants,
  getCommunityCount,
  getReferenceCountByStatus,
  getTopAuthors,
  getReferencesByState,
  getPlantsByState,
  getTopCommunitiesByPlants,
  getTopReferencesByCommunities,
  getTopReferencesByPlants,
  getPublicationsByYear
};
