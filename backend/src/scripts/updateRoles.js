// Migration script to update user roles
db.users.updateMany(
  { role: "super_admin" },
  { $set: { role: "superAdmin" } }
);

db.users.updateMany(
  { role: "state_admin" },
  { $set: { role: "stateAdmin" } }
);

db.users.updateMany(
  { role: "district_admin" },
  { $set: { role: "districtAdmin" } }
);