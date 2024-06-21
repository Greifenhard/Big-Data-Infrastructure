FROM bitnami/spark:3.5.1

#------------------------------------
# Set execution environment

ENV SPARK_VERSION "3.5.1"

#------------------------------------
# Download Java dependencies (Kafka, MariaDB) using Ivy (cf. https://stackoverflow.com/a/15456621) 

ENV IVY_PACKAGE_DIR "/tmp/.ivy"
ENV EXTRA_JAR_PATH "/opt/bitnami/spark/jars"

ENV IVY_CMD "java -Divy.default.ivy.user.dir=/tmp/.ivy-home -jar ${EXTRA_JAR_PATH}/ivy-*.jar -cache ${IVY_PACKAGE_DIR} -retrieve ${EXTRA_JAR_PATH}/[artifact]-[revision](-[classifier]).[ext]"

# Dependencies for Spark Kafka
RUN echo Using ivy command: ${IVY_CMD}
RUN ${IVY_CMD} -dependency "org.apache.spark" "spark-sql-kafka-0-10_2.12" "${SPARK_VERSION}" 
RUN ${IVY_CMD} -dependency "org.apache.spark" "spark-streaming-kafka-0-10-assembly_2.12" "${SPARK_VERSION}"

# Dependencies for database connection
ENV MYSQL_DB_VERSION "8.4.0"
RUN ${IVY_CMD} -dependency "com.mysql" "mysql-connector-j" "${MYSQL_DB_VERSION}"
ENV JDBC_JAR_FILE "${EXTRA_JAR_PATH}/mysql-connector-j-${MYSQL_DB_VERSION}.jar"

# Delete temp dir
RUN rm -rf ${IVY_PACKAGE_DIR}

#------------------------------------

# Dependencies for ML

RUN pip install numpy

#------------------------------------

# Prepare the system

WORKDIR /app/
USER root

# Workaround for "failure to login" error message: 
# cf. https://stackoverflow.com/questions/41864985/hadoop-ioexception-failure-to-login/56083736
RUN groupadd --gid 1001 spark
RUN useradd --uid 1001 --gid spark --shell /bin/bash spark
# End: Workaround

RUN apt-get update && apt-get install -y zip
RUN chown spark:spark /app/

USER spark
WORKDIR /app

#------------------------------------
# Copy the application code into the container

# Copy application code
COPY --chown=spark:spark *.py /app/

# Copy data
COPY MovieLens-1Mil-Dataset/* /app/MovieLens-1Mil-Dataset/

ENTRYPOINT /opt/bitnami/spark/bin/spark-submit \
	--master local \
	--jars ${JDBC_JAR_FILE} \
	/app/spark-app.py

CMD ["bash"]
