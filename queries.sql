--create new user for application, % = to server

CREATE USER 'alan'@'%' IDENTIFIED WITH mysql_native_password BY 'siapk';

grant all privileges on *.* to 'alan'@'%';

FLUSH PRIVILEGES;

INSERT INTO products (name, cost, description, warranty, indoor_unit, outdoor_unit, date_created) VALUES
("Daikin iSmile series system 4", 4000, "PRICE included for FREE deliver, piping and trunking installation (for no more than 15m from each indoor unit)", "1 Year on Machine & Parts, 5 Years on Compressor",  "3 x CTKM25VVMG, 1 x CTKM35VVMG", "1 x MKM100VVMG", NOW()),
("Mitsubishi Starmex System 2", 2500, "PRICE included for FREE deliver, piping and trunking installation (for no more than 15m from each indoor unit)","1 Year on Machine & Parts, 5 Years on Compressor",  "2 x MSXY-FP10VE", "1 x MXY-2H20VA2",NOW());

INSERT INTO applications (name) VALUES
("Residential"),("Commercial"),("Industrial")

INSERT INTO tags (name) VALUES
("R32 gas"),("Smart WIFI Control"),("PM2.5 filters"), ("Auto 3D airflow"), ("NEA 5-ticks"), ("Low Noise 19dB")
