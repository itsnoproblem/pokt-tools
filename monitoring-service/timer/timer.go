package timer

import "time"

type Timer struct {
	startedAt time.Time
}

func (t *Timer) Elapsed() time.Duration {
	return time.Since(t.startedAt)
}

func Start() Timer {
	return Timer{
		startedAt: time.Now(),
	}
}
