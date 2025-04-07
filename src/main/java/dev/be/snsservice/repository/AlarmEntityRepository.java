package dev.be.snsservice.repository;

import dev.be.snsservice.model.entity.AlarmEntity;
import dev.be.snsservice.model.entity.CommentEntity;
import dev.be.snsservice.model.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmEntityRepository extends JpaRepository<AlarmEntity, Integer> {
    Page<AlarmEntity> findAllByUserId(Integer userId, Pageable pageable);
}
