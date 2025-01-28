import sequelize from "../db.js";
import { Sequelize } from "sequelize";

export const healthCheckModel = sequelize.define('health_check', {
    check_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    datetime: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    }
  });


