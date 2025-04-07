package dev.be.snsservice.util;

import javax.swing.text.html.Option;
import java.util.Optional;

public class ClassUtils {

    public static <T> Optional<T> getSafeCastInstance(Object o, Class<T> clazz) {
        return Optional.ofNullable(clazz.cast(o));
    }
}
