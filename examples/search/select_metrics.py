from aim.sdk import select_metrics


if __name__ == '__main__':
    metrics = select_metrics((
        'loss if '
        '   experiment == test_indicator '
        '   and run.archived is True '
        '   and metrics.loss.train.nmt >= 12 '
    ))
    print(metrics)
