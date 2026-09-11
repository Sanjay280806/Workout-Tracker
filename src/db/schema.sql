CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY, 
    --The database automatically generates unique IDs.
    -- modern = BIGINT GENERATED ALWAYS AS IDENTITY

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    category VARCHAR(50) NOT NULL,

    muscle_group VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT exercises_category_check
        CHECK (
            category IN (
                'strength',
                'cardio',
                'flexibility'
            )
        )
);

CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,

    scheduled_at TIMESTAMPTZ,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT workouts_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT workouts_status_check
        CHECK (
            status IN (
                'pending',
                'active',
                'completed',
                'cancelled'
            )
        )
);

CREATE TABLE workout_exercises (
    id BIGSERIAL PRIMARY KEY,

    workout_id BIGINT NOT NULL,

    exercise_id BIGINT NOT NULL,

    sets INTEGER,

    reps INTEGER,

    weight_kg NUMERIC(6,2),

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT workout_exercises_workout_fk
        FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    CONSTRAINT workout_exercises_exercise_fk
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE RESTRICT,

    CONSTRAINT workout_exercises_sets_check
        CHECK (sets IS NULL OR sets > 0),

    CONSTRAINT workout_exercises_reps_check
        CHECK (reps IS NULL OR reps > 0),

    CONSTRAINT workout_exercises_weight_check
        CHECK (weight_kg IS NULL OR weight_kg >= 0)
);