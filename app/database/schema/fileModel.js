// fileModel.js
import sequelize from "../db.js";
import { Sequelize } from "sequelize";

export const fileModel = sequelize.define('file', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  file_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  upload_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW
    },
  file_size: {
    type: Sequelize.INTEGER,
    allowNull: false
    },
    mime_type: {
    type: Sequelize.STRING,
    allowNull: false
    }
}, {
  tableName: 'files'
});