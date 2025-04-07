package dev.be.snsservice.controller.response;

import dev.be.snsservice.model.Alarm;
import dev.be.snsservice.model.AlarmArgs;
import dev.be.snsservice.model.AlarmType;
import dev.be.snsservice.model.User;
import dev.be.snsservice.model.entity.AlarmEntity;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class AlarmResponse {
    private Integer id;
    private AlarmType alarmType;
    private AlarmArgs alarmArgs;
    private String text;
    private Timestamp registeredAt;
    private Timestamp updatedAt;
    private Timestamp deletedAt;

    public static AlarmResponse fromAlarm(Alarm alarm) {
        return new AlarmResponse(
                alarm.getId(),
                alarm.getAlarmType(),
                alarm.getArgs(),
                alarm.getAlarmType().getAlarmText(),
                alarm.getRegisteredAt(),
                alarm.getUpdatedAt(),
                alarm.getDeletedAt()
        );
    }
}
