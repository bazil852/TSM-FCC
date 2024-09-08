import { createSlice } from '@reduxjs/toolkit';

export const DataArraySlice = createSlice({
  name: 'dataArray',
  initialState: {
    onlyOneOwnTank: false,
    newMapCreated: true,
    ExerciseInfo: {
      mapName: '', // Changed mapArea to mapName
      exerciseTime: '',
      terrain: '',
      totalEnemyTanks: 0,
      totalEnemyAPCs: 0,
      student: '',
      instructor: '',
      difficulty: '',
    },
    WeatherConditions: {
      TimeOfDay: '',
      WeatherCondition: '',
      WeatherConditionIntensity: 0,
      Visibilty: 0,
      temperature: 0,
      WindSpeed: 0,
      WindDirection: 0,
    },
    totalOwnTanks: 0,
    totalEnemies: 0,
    Player: {},
    Enemy: {},
    Items: {
      House: [],
      Trees: [],
      Shop: [],
      Shack: [],
      SmallHouse: [],
      VillageHut: [],
      WareHouse: [],
      WaterTankTower: [],
      Hospital: [],
      Store: [],
      RailwayStation: [],
      Jhompri: [],
      Rocks: [],
    },
  },

  reducers: {
    resetDataArray: () => {
      return DataArraySlice.getInitialState();
    },
    setOnlyOneOwnTank: (state, action) => {
      state.onlyOneOwnTank = action.payload;
    },
    setNewMapCreated: (state, action) => {
      // New reducer to update newMapCreated
      state.newMapCreated = action.payload;
    },
    setStudent: (state, action) => {
      state.ExerciseInfo.student = action.payload;
    },
    setInstructor: (state, action) => {
      state.ExerciseInfo.instructor = action.payload;
    },
    setWeather: (state, action) => {
      state.WeatherConditions.TimeOfDay = action.payload;
    },
    setWeatherConditionIntensity: (state, action) => {
      state.WeatherConditions.WeatherConditionIntensity = action.payload;
    },
    setWeatherVisibility: (state, action) => {
      state.WeatherConditions.Visibilty = action.payload;
    },
    setWeatherCondition: (state, action) => {
      state.WeatherConditions.WeatherCondition = action.payload;
    },
    setTemperature: (state, action) => {
      state.WeatherConditions.temperature = action.payload;
    },
    setWindSpeed: (state, action) => {
      state.WeatherConditions.WindSpeed = action.payload;
    },
    setWindDirection: (state, action) => {
      state.WeatherConditions.WindDirection = action.payload;
    },
    setDifficulty: (state, action) => {
      state.ExerciseInfo.difficulty = action.payload;
    },
    setMapName: (state, action) => {
      // Changed setMapArea to setMapName
      state.ExerciseInfo.mapName = action.payload;
    },
    setExerciseTime: (state, action) => {
      state.ExerciseInfo.exerciseTime = action.payload;
    },
    setTerrain: (state, action) => {
      state.ExerciseInfo.terrain = action.payload;
    },
    addEnemy: (state, action) => {
      const {
        enemyName,
        path = [],
        unitId,
        initialAmmo = {},
        spawning_point = {},
        initialDirection,
      } = action.payload;

      if (!state.Enemy[enemyName]) {
        state.Enemy[enemyName] = [];
      }

      const enemyIndex = state.Enemy[enemyName].findIndex(
        (enemy) => enemy.unitId === unitId,
      );

      if (enemyIndex !== -1) {
        state.Enemy[enemyName][enemyIndex].Path = path.map((point) => ({
          pointx: point.x,
          pointy: point.y,
        }));
        state.Enemy[enemyName][enemyIndex].Ammo = {
          Heat: initialAmmo.heat || 40,
          APFSDS: initialAmmo.apfsds || 40,
          HE: initialAmmo.he || 40,
          MG: initialAmmo.mg762 || 1000,
        };
        state.Enemy[enemyName][enemyIndex].initialDirection = initialDirection;
      } else {
        const newEnemy = {
          unitId: unitId,
          initialDirection: initialDirection,
          Ammo: {
            Heat: initialAmmo.Heat || 40,
            APFSDS: initialAmmo.APFSDS || 40,
            HE: initialAmmo.HE || 40,
            MG: initialAmmo.MG || 40,
          },
          SpawnLocation: {
            pointx: spawning_point.x,
            pointy: spawning_point.y,
          },
          Path: path.map((point) => ({
            pointx: point.x,
            pointy: point.y,
          })),
        };

        state.Enemy[enemyName].push(newEnemy);
      }
    },
    addEnemyCar: (state, action) => {
      const { enemyName, path, unitId, spawning_point, initialDirection } =
        action.payload;

      if (!state.Enemy[enemyName]) {
        state.Enemy[enemyName] = [];
      }

      const enemyIndex = state.Enemy[enemyName].findIndex(
        (enemy) => enemy.unitId === unitId,
      );

      if (enemyIndex !== -1) {
        state.Enemy[enemyName][enemyIndex].Path = path.map((point) => ({
          pointx: point.x,
          pointy: point.y,
        }));
        state.Enemy[enemyName][enemyIndex].initialDirection = initialDirection;
      } else {
        const newEnemy = {
          unitId: unitId,
          initialDirection: initialDirection,
          SpawnLocation: {
            pointx: spawning_point.x,
            pointy: spawning_point.y,
          },
          Path: path.map((point) => ({
            pointx: point.x,
            pointy: point.y,
          })),
        };

        state.Enemy[enemyName].push(newEnemy);
      }
    },
    addOwnTank: (state, action) => {
      const { path, unitId, initialAmmo, spawning_point, initialDirection } =
        action.payload;

      if (state.Player && state.Player.id === unitId) {
        state.Player.Ammo = {
          Heat: initialAmmo.heat,
          APFSDS: initialAmmo.apfsds,
          HE: initialAmmo.he,
          MG: initialAmmo.mg762,
        };
        state.Player.SpawnLocation = {
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
        state.Player.Path = path.map((point) => ({
          pointx: point.x,
          pointy: point.y,
        }));
        state.Player.initialDirection = initialDirection;
      } else {
        state.Player = {
          id: unitId,
          initialDirection: initialDirection,
          Ammo: {
            Heat: initialAmmo.heat,
            APFSDS: initialAmmo.apfsds,
            HE: initialAmmo.he,
            MG: initialAmmo.mg762,
          },
          SpawnLocation: {
            pointx: spawning_point.x,
            pointy: spawning_point.y,
          },
          Path: path.map((point) => ({
            pointx: point.x,
            pointy: point.y,
          })),
        };
      }
    },
    addTrees: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingTreeIndex = state.Items.Trees.findIndex(
        (object) => object.id === unitId,
      );

      if (existingTreeIndex !== -1) {
        state.Items.Trees[existingTreeIndex] = {
          ...state.Items.Trees[existingTreeIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Trees.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addWaterTankTower: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.WaterTankTower.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.WaterTankTower[existingIndex] = {
          ...state.Items.WaterTankTower[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.WaterTankTower.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addHospital: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Hospital.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Hospital[existingIndex] = {
          ...state.Items.Hospital[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Hospital.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addStore: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Store.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Store[existingIndex] = {
          ...state.Items.Store[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Store.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addRailwayStation: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.RailwayStation.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.RailwayStation[existingIndex] = {
          ...state.Items.RailwayStation[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.RailwayStation.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addJhompri: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Jhompri.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Jhompri[existingIndex] = {
          ...state.Items.Jhompri[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Jhompri.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addRocks: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Rocks.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Rocks[existingIndex] = {
          ...state.Items.Rocks[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Rocks.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addWareHouse: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.WareHouse.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.WareHouse[existingIndex] = {
          ...state.Items.WareHouse[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.WareHouse.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addVillageHut: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.VillageHut.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.VillageHut[existingIndex] = {
          ...state.Items.VillageHut[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.VillageHut.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addSmallHouse: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.SmallHouse.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.SmallHouse[existingIndex] = {
          ...state.Items.SmallHouse[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.SmallHouse.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addShack: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Shack.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Shack[existingIndex] = {
          ...state.Items.Shack[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Shack.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addShop: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.Shop.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.Shop[existingIndex] = {
          ...state.Items.Shop[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.Shop.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },

    addHouse: (state, action) => {
      const { unitId, spawning_point } = action.payload;

      const existingIndex = state.Items.House.findIndex(
        (object) => object.id === unitId,
      );

      if (existingIndex !== -1) {
        state.Items.House[existingIndex] = {
          ...state.Items.House[existingIndex],
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        };
      } else {
        state.Items.House.push({
          id: unitId,
          pointx: spawning_point.x,
          pointy: spawning_point.y,
        });
      }
    },
    updateTotalEnemies: (state, action) => {
      state.totalEnemies = action.payload;
    },
    updateTotalOwnTanks: (state, action) => {
      state.totalOwnTanks = action.payload;
    },
    updateTotalEnemyTanks: (state, action) => {
      state.ExerciseInfo.totalEnemyTanks = action.payload;
    },
    updateTotalEnemyAPCs: (state, action) => {
      state.ExerciseInfo.totalEnemyAPCs = action.payload;
    },
    deleteEnemy: (state, action) => {
      const unitId = action.payload;
      Object.keys(state.Enemy).forEach((enemyName) => {
        state.Enemy[enemyName] = state.Enemy[enemyName].filter(
          (enemy) => enemy.unitId !== unitId,
        );
        if (state.Enemy[enemyName].length === 0) {
          delete state.Enemy[enemyName];
        }
      });
    },
    deleteOwnTank: (state, action) => {
      const unitId = action.payload;
      if (state.Player && state.Player.id === unitId) {
        state.Player = {};
      }
    },
    deleteHouse: (state, action) => {
      const unitId = action.payload;

      state.Items.House = state.Items.House.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteShop: (state, action) => {
      const unitId = action.payload;

      state.Items.Shop = state.Items.Shop.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteSmallHouse: (state, action) => {
      const unitId = action.payload;

      state.Items.SmallHouse = state.Items.SmallHouse.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteShack: (state, action) => {
      const unitId = action.payload;

      state.Items.Shack = state.Items.Shack.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteRocks: (state, action) => {
      const unitId = action.payload;

      state.Items.Rocks = state.Items.Rocks.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteVillageHut: (state, action) => {
      const unitId = action.payload;

      state.Items.VillageHut = state.Items.VillageHut.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteWareHouse: (state, action) => {
      const unitId = action.payload;

      state.Items.WareHouse = state.Items.WareHouse.filter(
        (building) => building.id !== unitId,
      );
    },
    deleteTrees: (state, action) => {
      const unitId = action.payload;

      state.Items.Trees = state.Items.Trees.filter(
        (object) => object.id !== unitId,
      );
    },
    deleteWaterTankTower: (state, action) => {
      const unitId = action.payload;

      state.Items.WaterTankTower = state.Items.WaterTankTower.filter(
        (object) => object.id !== unitId,
      );
    },
    deleteHospital: (state, action) => {
      const unitId = action.payload;

      state.Items.Hospital = state.Items.Hospital.filter(
        (object) => object.id !== unitId,
      );
    },
    deleteStore: (state, action) => {
      const unitId = action.payload;

      state.Items.Store = state.Items.Store.filter(
        (object) => object.id !== unitId,
      );
    },
    deleteRailwayStation: (state, action) => {
      const unitId = action.payload;

      state.Items.RailwayStation = state.Items.RailwayStation.filter(
        (object) => object.id !== unitId,
      );
    },
    deleteJhompri: (state, action) => {
      const unitId = action.payload;

      state.Items.Jhompri = state.Items.Jhompri.filter(
        (object) => object.id !== unitId,
      );
    },
  },
});

export const {
  setOnlyOneOwnTank,
  setNewMapCreated, // Export the new action
  setStudent,
  setInstructor,
  setWeather,
  setTemperature,
  setWindSpeed,
  setWindDirection,
  setDifficulty,
  setMapName, // Changed setMapArea to setMapName
  setExerciseTime,
  setTerrain,
  addEnemy,
  addEnemyCar,
  addHouse,
  addShop,
  addShack,
  addTrees,
  addOwnTank,
  updateTotalEnemies,
  updateTotalOwnTanks,
  updateTotalEnemyTanks,
  updateTotalEnemyAPCs,
  deleteEnemy,
  deleteOwnTank,
  deleteHouse,
  deleteTrees,
  deleteShop,
  deleteShack,
  deleteSmallHouse,
  addSmallHouse,
  deleteVillageHut,
  addVillageHut,
  deleteWareHouse,
  addWareHouse,
  deleteWaterTankTower,
  addWaterTankTower,
  deleteHospital,
  addHospital,
  deleteStore,
  addStore,
  deleteRailwayStation,
  addRailwayStation,
  deleteJhompri,
  addJhompri,
  deleteRocks,
  addRocks,
  setWeatherCondition,
  setWeatherConditionIntensity,
  setWeatherVisibility,
  resetDataArray,
} = DataArraySlice.actions;

export default DataArraySlice.reducer;
